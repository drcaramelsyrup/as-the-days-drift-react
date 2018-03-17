import React from 'react';
import CycleSpanList from './CycleSpanList';

const Passage = (props) => {
  return <div>{
    props.data != null && createCycleSpanList(
      props.data.pid, 
      props.data.actions, 
      props.data.conditionals, 
      props.data.cycles, 
      props.data.text)
  }</div>;
}

const createCycleSpanList = (id, actions, conditionals, cycles, text) => {

  const wrapper = (input) => {
    return input == null ? null : input;
  }

  return <CycleSpanList data={
    {
      actions: wrapper(actions),
      conditionals: wrapper(conditionals),
      cycles: wrapper(cycles),
      id: wrapper(id),
      text: wrapper(text)
    }
  }/>

}

export default Passage;
