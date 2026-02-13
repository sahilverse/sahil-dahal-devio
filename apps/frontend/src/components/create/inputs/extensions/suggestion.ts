import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import CommandList from './CommandList';
import {
    Heading1,
    Heading2,
    List,
    ListOrdered,
    Quote,
    Terminal,
    Type,
} from 'lucide-react';

export const suggestion = {
    items: ({ query }: { query: string }) => {
        return [
            {
                title: 'Heading 1',
                description: 'Big section heading.',
                icon: Heading1,
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
                },
            },
            {
                title: 'Heading 2',
                description: 'Medium section heading.',
                icon: Heading2,
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
                },
            },
            {
                title: 'Bullet List',
                description: 'Create a simple bulleted list.',
                icon: List,
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range).toggleBulletList().run();
                },
            },
            {
                title: 'Numbered List',
                description: 'Create a list with numbering.',
                icon: ListOrdered,
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range).toggleOrderedList().run();
                },
            },
            {
                title: 'Quote',
                description: 'Capture a quotation.',
                icon: Quote,
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range).toggleBlockquote().run();
                },
            },
            {
                title: 'Code Block',
                description: 'Insert a raw code block.',
                icon: Terminal,
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
                },
            },
            {
                title: 'Text',
                description: 'Just start writing with plain text.',
                icon: Type,
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range).setNode('paragraph').run();
                },
            },
        ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()));
    },

    render: () => {
        let component: any;
        let popup: any;

        return {
            onStart: (props: any) => {
                component = new ReactRenderer(CommandList, {
                    props,
                    editor: props.editor,
                });

                if (!props.clientRect) {
                    return;
                }

                popup = tippy('body', {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                });
            },

            onUpdate(props: any) {
                component.updateProps(props);

                if (!props.clientRect) {
                    return;
                }

                popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                });
            },

            onKeyDown(props: any) {
                if (props.event.key === 'Escape') {
                    popup[0].hide();
                    return true;
                }
                return component.ref?.onKeyDown(props);
            },

            onExit() {
                popup[0].destroy();
                component.destroy();
            },
        };
    },
};
