/*
 * Copyright 2022 Adobe. All rights reserved.
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
import {
  Button,
  Cell,
  Column,
  ColumnProps,
  ColumnResizer,
  Dialog,
  DialogTrigger,
  Group,
  Heading,
  Input,
  ListBox,
  ListBoxItem,
  Menu,
  MenuTrigger,
  Modal,
  ModalOverlay,
  NumberField,
  Popover,
  ResizableTableContainer,
  Row,
  Select,
  SelectValue,
  Table,
  TableBody,
  TableHeader,
  TextField,
  useDragAndDrop
} from 'react-aria-components';
import {isTextDropItem} from 'react-aria';
import {MyMenuItem} from './utils';
import React from 'react';
import styles from '../example/index.css';
import {useListData} from 'react-stately';

export default {
  title: 'React Aria Components'
};

const ReorderableTable = ({
  initialItems
}: {
  initialItems: { id: string, name: string }[]
}) => {
  let list = useListData({initialItems});

  const {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => {
      return [...keys].map((k) => {
        const item = list.getItem(k);
        return {
          'text/plain': item.id,
          item: JSON.stringify(item)
        };
      });
    },
    getDropOperation: () => 'move',
    onReorder: (e) => {
      if (e.target.dropPosition === 'before') {
        list.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        list.moveAfter(e.target.key, e.keys);
      }
    },
    onInsert: async (e) => {
      const processedItems = await Promise.all(
        e.items
          .filter(isTextDropItem)
          .map(async (item) => JSON.parse(await item.getText('item')))
      );
      if (e.target.dropPosition === 'before') {
        list.insertBefore(e.target.key, ...processedItems);
      } else if (e.target.dropPosition === 'after') {
        list.insertAfter(e.target.key, ...processedItems);
      }
    },

    onDragEnd: (e) => {
      if (e.dropOperation === 'move' && !e.isInternal) {
        list.remove(...e.keys);
      }
    },

    onRootDrop: async (e) => {
      const processedItems = await Promise.all(
        e.items
          .filter(isTextDropItem)
          .map(async (item) => JSON.parse(await item.getText('item')))
      );

      list.append(...processedItems);
    }
  });

  return (
    <Table aria-label="Reorderable table" dragAndDropHooks={dragAndDropHooks}>
      <TableHeader>
        <MyColumn isRowHeader defaultWidth="50%">
          Id
        </MyColumn>
        <MyColumn>Name</MyColumn>
      </TableHeader>
      <TableBody
        items={list.items}
        renderEmptyState={({isDropTarget}) => (
          <span style={{color: isDropTarget ? 'red' : 'black'}}>
            Drop items here
          </span>
        )}>
        {(item) => (
          <Row>
            <Cell>{item.id}</Cell>
            <Cell>{item.name}</Cell>
          </Row>
        )}
      </TableBody>
    </Table>
  );
};

export const ReorderableTableExample = () => (
  <>
    <ResizableTableContainer style={{width: 300, overflow: 'auto'}}>
      <ReorderableTable initialItems={[{id: '1', name: 'Bob'}]} />
    </ResizableTableContainer>
    <ResizableTableContainer style={{width: 300, overflow: 'auto'}}>
      <ReorderableTable initialItems={[{id: '2', name: 'Alex'}]} />
    </ResizableTableContainer>
  </>
);

export const TableExample = () => {
  let list = useListData({
    initialItems: [
      {id: 1, name: 'Games', date: '6/7/2020', type: 'File folder'},
      {id: 2, name: 'Program Files', date: '4/7/2021', type: 'File folder'},
      {id: 3, name: 'bootmgr', date: '11/20/2010', type: 'System file'},
      {id: 4, name: 'log.txt', date: '1/18/2016', type: 'Text Document'}
    ]
  });

  return (
    <ResizableTableContainer style={{width: 300, overflow: 'auto'}}>
      <Table aria-label="Example table">
        <TableHeader>
          <MyColumn isRowHeader defaultWidth="50%">
            Name
          </MyColumn>
          <MyColumn>Type</MyColumn>
          <MyColumn>Date Modified</MyColumn>
          <MyColumn>Actions</MyColumn>
        </TableHeader>
        <TableBody items={list.items}>
          {(item) => (
            <Row>
              <Cell>{item.name}</Cell>
              <Cell>{item.type}</Cell>
              <Cell>{item.date}</Cell>
              <Cell>
                <DialogTrigger>
                  <Button>Delete</Button>
                  <ModalOverlay
                    style={{
                      position: 'fixed',
                      zIndex: 100,
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      background: 'rgba(0, 0, 0, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                    <Modal
                      style={{
                        background: 'Canvas',
                        color: 'CanvasText',
                        border: '1px solid gray',
                        padding: 30
                      }}>
                      <Dialog>
                        {({close}) => (
                          <>
                            <Heading slot="title">Delete item</Heading>
                            <p>Are you sure?</p>
                            <Button onPress={close}>Cancel</Button>
                            <Button
                              onPress={() => {
                                close();
                                list.remove(item.id);
                              }}>
                              Delete
                            </Button>
                          </>
                        )}
                      </Dialog>
                    </Modal>
                  </ModalOverlay>
                </DialogTrigger>
              </Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </ResizableTableContainer>
  );
};

export const TableDynamicExample = () => {
  let columns = [
    {name: 'Name', id: 'name', isRowHeader: true},
    {name: 'Type', id: 'type'},
    {name: 'Date Modified', id: 'date'}
  ];

  let rows = [
    {id: 1, name: 'Games', date: '6/7/2020', type: 'File folder'},
    {id: 2, name: 'Program Files', date: '4/7/2021', type: 'File folder'},
    {id: 3, name: 'bootmgr', date: '11/20/2010', type: 'System file'},
    {id: 4, name: 'log.txt', date: '1/18/20167', type: 'Text Document'}
  ];

  return (
    <Table aria-label="Files">
      <TableHeader columns={columns}>
        {(column) => (
          <Column isRowHeader={column.isRowHeader}>{column.name}</Column>
        )}
      </TableHeader>
      <TableBody items={rows}>
        {(item) => (
          <Row columns={columns}>
            {(column) => {
              return <Cell>{item[column.id]}</Cell>;
            }}
          </Row>
        )}
      </TableBody>
    </Table>
  );
};

const MyColumn = (props: ColumnProps) => {
  return (
    <Column {...props}>
      {({startResize}) => (
        <div style={{display: 'flex'}}>
          <MenuTrigger>
            <Button style={{flex: 1, textAlign: 'left'}}>
              {props.children as React.ReactNode}
            </Button>
            <Popover>
              <Menu className={styles.menu} onAction={() => startResize()}>
                <MyMenuItem id="resize">Resize</MyMenuItem>
              </Menu>
            </Popover>
          </MenuTrigger>
          <ColumnResizer
            onHoverStart={action('onHoverStart')}
            onHoverChange={action('onHoverChange')}
            onHoverEnd={action('onHoverEnd')}>
            ↔
          </ColumnResizer>
        </div>
      )}
    </Column>
  );
};

export const BuggyTable = () => {
  return (
    <Table>
      <TableHeader>
        <Column isRowHeader>Name</Column>
        <Column>Gender</Column>
        <Column>Address</Column>
        <Column>Age</Column>
      </TableHeader>
      <TableBody>
        <Row>
          <Cell>Alice</Cell>
          <Cell>
            <CustomSelect />
          </Cell>
          <Cell>
            <CustomTextField />
          </Cell>
          <Cell>
            <CustomNumberField />
          </Cell>
        </Row>
        <Row>
          <Cell>Bob</Cell>
          <Cell>
            <select>
              <option>Male</option>
              <option>Female</option>
            </select>
          </Cell>
          <Cell>
            <CustomTextField />
          </Cell>
          <Cell>
            <CustomNumberField />
          </Cell>
        </Row>
      </TableBody>
    </Table>
  );
};

function CustomSelect() {
  return (
    <Select name="cc" aria-label="bb">
      <Button>
        <SelectValue />
      </Button>
      <Popover>
        <ListBox>
          <ListBoxItem>Male</ListBoxItem>
          <ListBoxItem>Female</ListBoxItem>
        </ListBox>
      </Popover>
    </Select>
  );
}

function CustomTextField() {
  return (
    <TextField isRequired>
      <Input />
    </TextField>
  );
}

function CustomNumberField() {
  return (
    <NumberField>
      <Group>
        <Input />
        <div>
          <Button slot="increment">up</Button>
          <div />
          <Button slot="decrement">down</Button>
        </div>
      </Group>
    </NumberField>
  );
}
