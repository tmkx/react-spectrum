/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {action} from '@storybook/addon-actions';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {expect} from '@storybook/jest';
import {Item, Picker, Section, SpectrumPickerProps} from '../';
import React from 'react';
import {userEvent, within} from '@storybook/testing-library';

export type PickerStory = ComponentStoryObj<typeof Picker>;

export default {
  title: 'Picker',
  component: Picker,
  excludeStories: [],
  args: {
    'label': 'Test',
    onSelectionChange: action('onSelectionChange')
  },
  argTypes: {
    layout: {
      table: {
        disable: true
      }
    },
    children: {
      table: {
        disable: true
      }
    }
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // // The following rule (aka focusable elements shouldn't be aria-hidden) will not run based on the CSS selector provided
            // // TODO: the axe test still fails for some reason...
            // id: 'aria-hidden-focus',
            // selector: '*:not(#blah)'
            id: 'aria-hidden-focus',
            enabled: false
          }
        ]
      },
      options: {}
    }
  }
} as ComponentMeta<typeof Picker>;

export const Default: SectionsStory = {
  render: (args) => <DefaultPicker {...args} />
};

export type SectionsStory = ComponentStoryObj<typeof DefaultPicker>;
export const Sections: PickerStory = {
  args: {
    children: (
      <Section title="Animals">
        <Item key="Aardvark">Aardvark</Item>
        <Item key="Kangaroo">Kangaroo</Item>
        <Item key="Snake">Snake</Item>
      </Section>
    )
  }
};

Sections.play = async ({canvasElement}) => {
  let canvas = within(canvasElement);
  let button = await canvas.findByRole('button');
  userEvent.click(button);
  let body = canvasElement.ownerDocument.body;
  let listbox = await within(body).findByRole('listbox');

  expect(await within(listbox).findByText('Animals')).toBeInTheDocument();

  let groups = await within(listbox).findAllByRole('group');
  expect(groups).toHaveLength(1);

  let items = await within(listbox).findAllByRole('option');
  expect(items.length).toBe(3);
  expect(items[0]).toHaveTextContent('Aardvark');
  expect(items[1]).toHaveTextContent('Kangaroo');
  expect(items[2]).toHaveTextContent('Snake');
  expect(document.activeElement).toBe(listbox);
};

function DefaultPicker(props: SpectrumPickerProps<object>) {
  return (
    <Picker {...props}>
      <Item key="Short">Short</Item>
      <Item key="Normal">Normal</Item>
      <Item key="This item is very long and word wraps poorly">This item is very long and word wraps poorly</Item>
    </Picker>
  );
}
