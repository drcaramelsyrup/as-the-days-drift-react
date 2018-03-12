import React from 'react';
import CycleSpan from './CycleSpan';

const Passage = (props) => {
  return <div>{
    props.data != null && createCycleSpan(props.data.text)
  }</div>;
}

const preprocessData = (jsonData) => {
  const textList = [];

  const cycleIds = Object.keys(jsonData.cycles).sort((a, b) => {
    return jsonData.text.indexOf(a) < jsonData.text.indexOf(b);
  });

  const isValidIndex = (idx) => {
    return idx >= 0 && idx < cycleIds.length;
  }
  return cycleIds.reduce((acc, id, idx) => {
    // Start at the beginning or at the last cycle id position.
    const start = isValidIndex(idx - 1) 
      ? jsonData.text.indexOf(cycleIds[idx - 1])
      : 0;
    const end = isValidIndex(idx + 1)
      ? jsonData.text.indexOf(cycleIds[idx + 1])
      : jsonData.text.length;

    const position = jsonData.text.indexOf(id);

    const before = jsonData.text.substr(start, position - start);
    const after = jsonData.text.substr(position + id.length, end);

    const toConcat = [];

    toConcat.push({
      text: before,
      cycles: [],
      cycleId: null
    });

    toConcat.push({
      text: '',
      cycles: jsonData.cycles[id],
      cycleId: id
    })

    toConcat.push({
      text: after,
      cycles: [],
      cycleId: null
    });

    return acc.concat(toConcat);
  }, []);
}

const setData = (data) => {
  // enter

  // update

  // exit
}

const getCycleSpans = (data) => {

  Object.keys(data.cycles).forEach((cycleId) => {
    const links = data.cycles[cycleId] || [];

  });

  createCycleSpan()

}

const createCycleSpan = (text, cycles = null) => {
  return <CycleSpan text={ text } cycles={ cycles }/>;
}

export default Passage;
