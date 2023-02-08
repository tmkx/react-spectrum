import React, {useRef} from 'react';
import {useTableContext} from './TableView';
import {useVisuallyHidden} from '@react-aria/visually-hidden';

export default function RootDropIndicator() {
  let {dropState, dragAndDropHooks} = useTableContext();
  let ref = useRef();
  let {dropIndicatorProps} = dragAndDropHooks.useDropIndicator({
    target: {type: 'root'}
  }, dropState, ref);
  let isDropTarget = dropState.isDropTarget({type: 'root'});
  let {visuallyHiddenProps} = useVisuallyHidden();

  if (!isDropTarget && dropIndicatorProps['aria-hidden']) {
    return null;
  }

  return (
    <div role="row" aria-hidden={dropIndicatorProps['aria-hidden']}>
      <div
        role="gridcell"
        aria-selected="false">
        <div role="button" {...visuallyHiddenProps} {...dropIndicatorProps} ref={ref} />
      </div>
    </div>
  );
}