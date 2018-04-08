import argparse
import re
import json
import os

parser = argparse.ArgumentParser(description='Bleh')
parser.add_argument('-d', '--delete', help='Delete source file after parsing', action='store_true')
parser.add_argument('source', help='Source file for conversation (in Entweedle format)')
parser.add_argument('dest', help='Destination file for conversation (in JSON)')
args = parser.parse_args()

source_file = open(args.source, 'r')
source_raw = source_file.read()
source_file.close()

# Group the first newline after text with the preceding text
source_nodes = [[s for s in re.split(r'(.*\n)', x) if len(s)] for x in re.split('\n:: ', source_raw) if len(x)]
conv_title = source_nodes[0][1]	#title of conversation - not actually used
conv_nodes = source_nodes[3:]
conv_dict = {}		#map of node title -> node info
main_speaker = ''	#default speaker - any nodes without speaker tag are assumed to have this speaker

titlesToIds = {}	#for changing node titles to indices

#
# Utility Functions
#

def isNumeric(value):
	try:
		float(value)
		return True
	except ValueError:
		return False

def stripQuotes(value):
	return value.strip('\'').strip('\"')

def parseCondition(line):
	ret = {}
	if line.strip().startswith('(if:'):
		conds = [s.strip() for s in re.split(r'and', line[:line.find(')')]) if len(s) > 0]
		for cond in conds:
			cond_elements = [x for x in re.split(r'[\$ ]', cond) if len(x) > 0]
			cond_var = cond_elements[1]
			cond_type = cond_elements[2]
			cond_val = stripQuotes(cond_elements[3])

			ret[cond_var] = {}
			ret[cond_var]['type'] = cond_type
			ret[cond_var]['val'] = float(cond_val) if isNumeric(cond_val) else cond_val
	return ret

def makeConditionId(cond_id):
	return '_cond_text_' + str(cond_id)

def extractConditionalBlocks(text):
	cond_id = 0		# increments after each use

	def handleConditionalBlock(block, in_id, node_text, blocks, cond_stack):
		out_text = node_text

		# base case
		if not len(block):
			return [out_text, blocks]

		link_marker = block.find('(link:')
		if_start_marker = block.find('(if:')
		if_end_marker = block.find('[')
		block_end_marker = block.find(']')

		markers = [m for m in [if_start_marker, block_end_marker, link_marker] if m >= 0]
		if not len(markers):
			# no more conditionals, finish un-conditional text
			if not len(cond_stack):
				out_text += block
				return [out_text, blocks]

		until_marker = min(markers)

		# just skip anything beyond links for now
		if until_marker == link_marker:
			return [out_text, blocks]

		# Recursion:
		# append current text
		if not len(cond_stack):
			out_text += block[:until_marker]
		else:
			cond_stack[-1]['text'] += block[:until_marker]
			# finish block
			no_ifs_before = if_start_marker < 0 or block_end_marker < if_start_marker
			if block_end_marker >= 0 and no_ifs_before:
				blocks.append(cond_stack[-1])
				cond_stack.pop()
				return handleConditionalBlock(block[block_end_marker+1:], in_id, out_text, blocks, cond_stack)

		# start new block
		if if_start_marker >= 0 and if_end_marker >= 0:
			next_if_start_marker = block.find('(if:', if_end_marker+1)
			end_of_cond_text = min(m for m in [next_if_start_marker, block_end_marker] if m >= 0)

			cond_element = {}
			cond_element['id'] = makeConditionId(in_id)
			cond_element['conditions'] = parseCondition(block[:if_end_marker+1])
			cond_element['text'] = ''

			cond_stack.append(cond_element)
			out_text += cond_element['id']
			return handleConditionalBlock(block[if_end_marker+1:], in_id + 1, out_text, blocks, cond_stack)

		print('Invalid conditional block')
		print('-------TEXT-------: ', out_text)
		print('-------BLOCKS-----: ', blocks) 
		print('-------STACK------: ', cond_stack)
		return [out_text, blocks]

	[out_text, blocks] = handleConditionalBlock(text, cond_id, '', [], [])
	return [out_text, blocks]

def extractNodeName(node):
	node_title_split = re.split(r'[\[\]]', node[0])
	node_name = node_title_split[0].strip()
	speaker = ''
	if len(node_title_split) < 2 or not len(node_title_split[1]):
		speaker = main_speaker
	else:
		speaker = node_title_split[1].replace('_', ' ')
	return [node[1:], node_name, speaker]

def extractResponses(text):
	responses = []
	out_text = ''
	for line in text:
		stripline = line.strip()
		# Response
		if stripline.startswith('[[') and stripline.endswith(']]'):
			response = re.split('->', stripline[2:-2])
			if len(response) == 1:
				responses.append({'text': response[0], 'target': response[0]})
			else:
				responses.append({'text': response[0], 'target': response[1]})
		# Response + Conditions
		elif stripline.startswith('(if:') and stripline.endswith(']]]'):
			cond_and_response = re.split(r'\)\[\[\[', stripline)
			response = cond_and_response[1][:-3]
			conds = [x.strip() for x in re.split(r'and', cond_and_response[0][5:])]
			conditions = {}
			for cond in conds:
				cond = [x for x in re.split(r'[\$) ]', cond) if len(x) > 0]
				cond_var = cond[0]
				if cond[2] == 'not':
					cond_val = '!' + cond[3]
				else:
					cond_val = cond[2]
				conditions[cond_var] = cond_val
			response = re.split('->', response)
			if len(response) == 1:
				responses.append({'text': response[0], 'target': response[0], 'conditions': conditions})
			else:
				responses.append({'text': response[0], 'target': response[1], 'conditions': conditions})
		# Not a response
		else:
			out_text += line

	return [out_text, responses]

def parseCycles(text):
	out_text = ''
	cycles = {}

	index = 0
	end_marker_count = 0
	# cycling_links = re.split(r'\(link:', text)
	while index < len(text):
		new_cycle = {}

		link_start = text.find('(link:', index)
		link_end = text.find(']', link_start)
		if link_start < 0 or link_end < 0:
			break
		# this line determines a cycling text link

		# a condition should wrap around the whole of the link
		if_start = text.find('(if:', index)
		if_end = text.find('[', if_start)
		if if_start >= 0 and if_start < link_start:
			# this is the condition for this link
			if if_end+1 == link_start:
				new_cycle['conditions'] = parseCondition(text[if_start:if_end])
		# these link attributes should all be on the same line as the start identifier
		lines = [s for s in re.split(r'\n', text[link_start:]) if len(s) > 0]
		line = lines[0]
		# this is a quality setting substring(s)
		set_strs = [s for s in re.split(r'\(set:', line) if len(s) > 0]
		new_cycle['actions'] = {}
		for s in set_strs[1:]:
			action = [x for x in re.split(r'[\$) ]', s) if len(x) > 0]
			action_variable = action[0]
			action_value = stripQuotes(action[2])
			new_cycle['actions'][action_variable] = float(action_value) if isNumeric(action_value) else action_value
		# replace Twine macro determines our id
		replace_start = text.find('(replace:', link_start)
		replace_end = text.find('[', replace_start)
		cycle_id = ''
		if replace_start >= 0 and replace_end >= 0:
			replace_str = [x for x in re.split('\"', line[line.find('(replace:') + len('(replace:'):]) if len(x) > 0]
			cycle_id = replace_str[1]
		# text enclosed in brackets
		cycle_text_start = text.find('[', replace_start)
		cycle_text_end = text.find(']', cycle_text_start)
		new_cycle['text'] = text[cycle_text_start+1:cycle_text_end]
		if cycle_id:
			if cycle_id not in cycles:
				cycles[cycle_id] = []
			# add created cycle object
			cycles[cycle_id].append(new_cycle)

		index = cycle_text_end
	return cycles

def extractActions(text):
	out_text = ''
	actions = {}
	for line in text:
		if line.strip().startswith('(set:'):
			action = [x for x in re.split(r'[\$) ]', line.strip()) if len(x)]
			action_variable = action[1]
			action_value = stripQuotes(action[3])
			actions[action_variable] = float(action_value) if isNumeric(action_value) else action_value
		else:
			out_text += line
	return [out_text, actions]

def removeExtraneousLines(text):
	out_text = ''
	cycle = 0
	showOnce = 0
	comments = ''
	for line in text:
		if not len(line.strip('\t')):
			continue
		stripline = line.strip()
		if stripline.startswith('<!--'):
			comment_type = stripline[len('<!--'):-len('-->')].strip()
			if comment_type.upper() == 'SHOW_ONCE':
				showOnce = 1
			elif comment_type.upper() == 'CYCLE':
				cycle = 1
				continue
			elif comment_type.upper() == 'END_CYCLE':
				cycle = 0
				continue
			else:
				comments += comment_type
		if cycle > 0:
			continue
		out_text += line
	return [out_text, showOnce, comments]

def createConvNode(node, id):
	[node_text, node_name, speaker] = extractNodeName(node)
	[node_text, node_responses] = extractResponses(node_text)
	cycles = parseCycles(node_text)
	[node_text, cond_texts] = extractConditionalBlocks(node_text)
	[node_text, actions] = extractActions(node_text)
	[node_text, showOnce, comments] = removeExtraneousLines(node_text)

	# if there are no responses to this node, make it an end node
	if not len(node_responses):
		node_responses.append({'text': 'END', 'target': -1})

	titlesToIds[node_name] = id

	return {
		'id': id,
		'name': node_name,
		'text': node_text,
		'comments': comments,
		'responses': node_responses,
		'actions': actions,
		'speaker': speaker,
		'showOnce': showOnce,
		'cycles': cycles,
		'conditionals': cond_texts
	}

#
# End Utility Functions
#

### Main

conv_dict['start'] = createConvNode(conv_nodes[0], 0)	# this is the NPC greeting and conversation root
main_speaker = conv_dict['start']['speaker']			# this is the main speaker in the conversation

# populate map of node title -> node info
for i, node in enumerate(conv_nodes):
	conv_node = createConvNode(node, i)
	conv_dict[conv_node['name']] = conv_node

# populate map of node index -> node info, remap targets
conv_dict_idx = {}
for node_name in conv_dict:
	node = conv_dict[node_name]
	for response in node['responses']:
		if response['target'] != -1:
			response['target'] = titlesToIds[response['target']]
	del node['name']
	conv_dict_idx[node['id']] = node

# write to JSON file
with open(args.dest, 'w') as dest_file:
	json.dump(conv_dict_idx, dest_file, sort_keys=True, indent=4, separators=(',', ': '))

# if delete flag is set, delete source file
if args.delete:
	os.remove(args.source)