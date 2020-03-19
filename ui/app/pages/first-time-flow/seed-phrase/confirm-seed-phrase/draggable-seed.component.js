import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { DragSource, DropTarget } from 'react-dnd'

class DraggableSeed extends Component {

  static propTypes = {
    // React DnD Props
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    isDragging: PropTypes.bool,
    isOver: PropTypes.bool,
    canDrop: PropTypes.bool,
    // Own Props
    onClick: PropTypes.func.isRequired,
    setHoveringIndex: PropTypes.func.isRequired,
    index: PropTypes.number,
    draggingSeedIndex: PropTypes.number,
    word: PropTypes.string,
    className: PropTypes.string,
    selected: PropTypes.bool,
    droppable: PropTypes.bool,
  }

  static defaultProps = {
    className: '',
  }

  componentWillReceiveProps (nextProps) {
    const { isOver, setHoveringIndex } = this.props
    if (isOver && !nextProps.isOver) {
      setHoveringIndex(-1)
    }
  }

  render () {
    const {
      connectDragSource,
      connectDropTarget,
      isDragging,
      index,
      word,
      selected,
      className,
      onClick,
      isOver,
      canDrop,
    } = this.props

    return connectDropTarget(connectDragSource(
      <div
        key={index}
        className={classnames('btn-secondary notranslate confirm-seed-phrase__seed-word', className, {
          'confirm-seed-phrase__seed-word--selected btn-primary': selected,
          'confirm-seed-phrase__seed-word--dragging': isDragging,
          'confirm-seed-phrase__seed-word--empty': !word,
          'confirm-seed-phrase__seed-word--active-drop': !isOver && canDrop,
          'confirm-seed-phrase__seed-word--drop-hover': isOver && canDrop,
        })}
        onClick={onClick}
      >
        { word }
      </div>
    ))
  }
}

const SEEDWORD = 'SEEDWORD'

const seedSource = {
  beginDrag (props) {
    setTimeout(() => props.setDraggingSeedIndex(props.seedIndex), 0)
    return {
      seedIndex: props.seedIndex,
      word: props.word,
    }
  },
  canDrag (props) {
    return props.draggable
  },
  endDrag (props, monitor) {
    const dropTarget = monitor.getDropResult()

    if (!dropTarget) {
      setTimeout(() => props.setDraggingSeedIndex(-1), 0)
      return
    }

    props.onDrop(dropTarget.targetIndex)
  },
}

const seedTarget = {
  drop (props) {
    return {
      targetIndex: props.index,
    }
  },
  canDrop (props) {
    return props.droppable
  },
  hover (props) {
    props.setHoveringIndex(props.index)
  },
}

const collectDrag = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }
}

const collectDrop = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  }
}

export default DropTarget(SEEDWORD, seedTarget, collectDrop)(DragSource(SEEDWORD, seedSource, collectDrag)(DraggableSeed))


