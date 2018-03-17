import React from 'react';
import CycleSpan from './CycleSpan';

const Passage = (props) => {
  return <div>{
    props.data != null && getCycleSpans(props.data)
  }</div>;
}

const preprocessData = (jsonData) => {
  const textList = [];

  // TODO: more graceful way to check for properties?
  if (jsonData.cycles == null)
    return [ makeCycle(null, makeCycleData(jsonData.text)) ];

  const cycleIds = Object.keys(jsonData.cycles).sort((a, b) => {
    return jsonData.text.indexOf(a) > jsonData.text.indexOf(b);
  });

  const isValidIndex = (idx) => {
    return idx >= 0 && idx < cycleIds.length;
  }
  return cycleIds.reduce((acc, id, idx) => {

    // Start at the beginning or at the last cycle id position.
    const start = isValidIndex(idx - 1) 
      ? jsonData.text.indexOf(cycleIds[idx - 1]) + cycleIds[idx - 1].length
      : 0;
    const end = isValidIndex(idx + 1)
      ? jsonData.text.indexOf(cycleIds[idx + 1])
      : jsonData.text.length;

    const position = jsonData.text.indexOf(id);

    // Print before and after if it's the first, else print the after.
    const isFirstId = !isValidIndex(idx - 1);
    const before = isFirstId
      ? jsonData.text.substr(start, position - start)
      : '';

    const after = jsonData.text.substr(
      position + id.length, end - position - id.length);

    const toConcat = [];

    if (before.length > 0)
      toConcat.push(makeCycle(null, makeCycleData(before)));
    toConcat.push(makeCycle(id, ...jsonData.cycles[id]));
    if (after.length > 0)
      toConcat.push(makeCycle(null, makeCycleData(after)));

    return acc.concat(toConcat);

  }, []);
}

const makeCycle = (cycleId, ...dataEntries) => {
  return {
    cycle_id: cycleId,
    data: [ ...dataEntries ]
  };
}

const makeCycleData = (text, actions = null) => {
  return {
    actions: actions,
    text: text
  };
}

const getCycleSpans = (data) => {

  // TODO: bad practice to use idx in a component array
  const cycleArray = preprocessData(data);
  return cycleArray.reduce((acc, cycle, idx) => {
    return acc.concat([ <CycleSpan key={ 'cyclespan' + idx } cycle={ cycle } /> ]);
  }, []);

}

const createCycleSpan = (text, cycle = []) => {
  return <CycleSpan cycle={ cycle }/>;
}

export default Passage;
