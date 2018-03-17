import React from 'react';
import CycleSpan from './CycleSpan';

const Passage = (props) => {
  return <div>{
    props.data != null && createCycleSpan(props.data.text)
  }</div>;
}

export default ;
