import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export function SortableItem(props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative',
        touchAction: 'none' // Important for mobile DnD
    };

    return (
        <div ref={setNodeRef} style={style}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div {...attributes} {...listeners} style={{ cursor: 'grab', color: '#ccc' }}>
                    <GripVertical size={16} />
                </div>
                <div style={{ flex: 1 }}>
                    {props.children}
                </div>
            </div>
        </div>
    );
}
