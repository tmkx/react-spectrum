import {
  AriaButtonProps,
  AriaDialogProps,
  AriaOverlayProps,
  DismissButton,
  FocusScope,
  mergeProps,
  OverlayContainer,
  useButton,
  useDialog,
  useFocusRing,
  useMenu,
  useMenuItem,
  useMenuSection,
  useMenuTrigger,
  useModal, useOverlay, usePreventScroll, useSeparator
} from 'react-aria';
import {AriaMenuProps, MenuTriggerProps} from '@react-types/menu';
import ChevronDown from '@spectrum-icons/workflow/ChevronDown';
import {classNames} from '@react-spectrum/utils';
import {CSSTransition} from 'react-transition-group';
import {Item, Section} from '@react-stately/collections';
import {Node} from '@react-types/shared';
import React, {useRef} from 'react';
import styles from './styles.css';
import {TreeState, useTreeState} from '@react-stately/tree';
import {useMenuTriggerState} from '@react-stately/menu';


interface ButtonProps extends AriaButtonProps {
  isPressed?: boolean,
  variant?: 'default' | 'cta' | 'destructive'
}

export const Button = React.forwardRef(
  (props: ButtonProps, ref: React.RefObject<HTMLButtonElement>) => {
    let {buttonProps, isPressed} = useButton(props, ref);
    let {focusProps, isFocusVisible} = useFocusRing();

    let bg = 'bg-blue-500';
    if (props.isDisabled) {
      bg = 'bg-gray-400';
    } else if (isPressed || props.isPressed) {
      bg = 'bg-blue-600';
    }

    let focus = isFocusVisible ? 'ring ring-offset-2 ring-blue-400' : '';

    return (
      <button
        {...mergeProps(buttonProps, focusProps)}
        ref={ref}
        className={`${focus} text-white text-sm font-semibold py-2 px-4 rounded cursor-default focus:outline-none transition ${bg}`}>
        {props.children}
      </button>
    );
  }
);

interface AlertDialogProps extends AriaDialogProps, AriaOverlayProps {
  children: React.ReactNode,
  title: string,
  variant?: 'default' | 'destructive',
  confirmLabel: string
}

export function AlertDialog(props: AlertDialogProps) {
  let {children, onClose, confirmLabel} = props;

  let ref = React.useRef(null);
  let {overlayProps, underlayProps} = useOverlay(props, ref);
  usePreventScroll();
  let {modalProps} = useModal();
  let {dialogProps, titleProps} = useDialog(
    {
      ...props,
      role: 'alertdialog'
    },
    ref
  );

  return (
    // Animate opacity and backdrop blur of underlay
    <CSSTransition
      in={props.isOpen}
      unmountOnExit
      timeout={{enter: 0, exit: 350}}
      classNames={{
        enter: classNames(styles, 'opacity-0'),
        enterDone: classNames(styles, 'opacity-1'),
        exit: classNames(styles, 'opacity-0')
      }}>
      <div
        className={classNames(styles, 'fixed', 'inset-0', 'flex', 'justify-center', 'z-100')}
        {...underlayProps}>
        <FocusScope contain restoreFocus autoFocus>
          {/* Animate dialog slightly upward when entering, and downward when exiting. */}
          <CSSTransition
            in={props.isOpen}
            appear
            unmountOnExit
            timeout={{enter: 0, exit: 350}}
            classNames={{
              appear: classNames(styles, 'translate-y-2'),
              appearDone: classNames(styles, 'translate-y-0'),
              exit: classNames(styles, 'translate-y-2')
            }}>
            <div
              {...mergeProps(overlayProps, dialogProps, modalProps)}
              className={classNames(styles, 'z-1', 'relative')}>
              {props.variant === 'destructive' && (
                <div>S</div>
              )}
              <h3 {...titleProps} className="text-lg font-medium pb-2">
                {props.title}
              </h3>
              <p className="text-sm text-gray-600">{children}</p>
              <div className="pt-8 flex space-x-3 justify-end">
                <Button onPress={onClose}>Cancel</Button>
                <Button variant={props.variant || 'cta'} onPress={onClose}>
                  {confirmLabel}
                </Button>
              </div>
            </div>
          </CSSTransition>
        </FocusScope>
      </div>
    </CSSTransition>
  );
}

interface PopoverProps {
  popoverRef?: React.RefObject<HTMLDivElement>,
  children: React.ReactNode,
  isOpen?: boolean,
  onClose: () => void
}

export function Popover(props: PopoverProps) {
  let ref = React.useRef<HTMLDivElement>(null);
  let {popoverRef = ref, isOpen, onClose, children} = props;

  // Handle events that should cause the popup to close,
  // e.g. blur, clicking outside, or pressing the escape key.
  let {overlayProps} = useOverlay(
    {
      isOpen,
      onClose,
      shouldCloseOnBlur: true,
      isDismissable: false
    },
    popoverRef
  );

  // Add a hidden <DismissButton> component at the end of the popover
  // to allow screen reader users to dismiss the popup easily.
  return (
    <CSSTransition
      in={props.isOpen}
      unmountOnExit
      timeout={{enter: 0, exit: 350}}
      classNames={{
        enter: classNames(styles, 'opacity-0'),
        enterDone: classNames(styles, 'opacity-1'),
        exit: classNames(styles, 'opacity-0')
      }}>
      <FocusScope restoreFocus>
        <div
          {...overlayProps}
          ref={popoverRef}
          className="absolute z-10 top-full min-w-full shadow-lg border border-gray-300 bg-white rounded-md mt-2">
          {children}
          <DismissButton onDismiss={onClose} />
        </div>
      </FocusScope>
    </CSSTransition>
  );
}


interface MenuButtonProps<T extends object>
  extends AriaMenuProps<T>,
    MenuTriggerProps {
  label: string
}

export function MenuButton<T extends object>(props: MenuButtonProps<T>) {
  // Create state based on the incoming props
  let state = useMenuTriggerState(props);

  // Get props for the menu trigger and menu elements
  let ref = React.useRef();
  let {menuTriggerProps, menuProps} = useMenuTrigger({}, state, ref);

  return (
    <div style={{position: 'relative', display: 'inline-block'}}>
      <Button {...menuTriggerProps} isPressed={state.isOpen} ref={ref}>
        {props.label}
        <ChevronDown />
      </Button>
      {state.isOpen && (
        <Popover isOpen onClose={state.close}>
          <Menu
            {...menuProps}
            {...props}
            autoFocus={state.focusStrategy || true}
            onClose={() => state.close()} />
        </Popover>
      )}
    </div>
  );
}

interface MenuProps<T extends object> extends AriaMenuProps<T> {
  onClose: () => void
}

function Menu<T extends object>(props: MenuProps<T>) {
  // Create state based on the incoming props
  let state = useTreeState(props);

  // Get props for the menu element
  let ref = useRef();
  let {menuProps} = useMenu(props, state, ref);

  return (
    <ul
      {...menuProps}
      ref={ref}
      className="pt-1 pb-1 shadow-xs rounded-md min-w-[200px] focus:outline-none">
      {[...state.collection].map((item) => (
        <MenuSection
          key={item.key}
          section={item}
          state={state}
          onAction={props.onAction}
          onClose={props.onClose} />
      ))}
    </ul>
  );
}

interface MenuSectionProps<T> {
  section: Node<T>,
  state: TreeState<T>,
  onAction: (key: React.Key) => void,
  onClose: () => void
}

function MenuSection<T>({
                          section,
                          state,
                          onAction,
                          onClose
                        }: MenuSectionProps<T>) {
  let {itemProps, groupProps} = useMenuSection({
    heading: section.rendered,
    'aria-label': section['aria-label']
  });

  let {separatorProps} = useSeparator({
    elementType: 'li'
  });

  return (
    <>
      {section.key !== state.collection.getFirstKey() && (
        <li
          {...separatorProps}
          className="border-t border-gray-300 mx-2 mt-1 mb-1" />
      )}
      <li {...itemProps}>
        <ul {...groupProps}>
          {[...section.childNodes].map((node) => (
            <MenuItem
              key={node.key}
              item={node}
              state={state}
              onAction={onAction}
              onClose={onClose} />
          ))}
        </ul>
      </li>
    </>
  );
}

interface MenuItemProps<T> {
  item: Node<T>,
  state: TreeState<T>,
  onAction: (key: React.Key) => void,
  onClose: () => void
}

function MenuItem<T>({item, state, onAction, onClose}: MenuItemProps<T>) {
  // Get props for the menu item element
  let ref = React.useRef();
  let {menuItemProps} = useMenuItem(
    {
      key: item.key,
      onAction,
      onClose
    },
    state,
    ref
  );

  // Handle focus events so we can apply highlighted
  // style to the focused menu item
  let isFocused = state.selectionManager.focusedKey === item.key;
  let focusBg = item.key === 'delete' ? 'bg-red-500' : 'bg-blue-500';
  let focus = isFocused ? `${focusBg} text-white` : 'text-gray-900';

  return (
    <li
      {...menuItemProps}
      ref={ref}
      className={`${focus} text-sm cursor-default select-none relative mx-1 rounded py-2 pl-3 pr-9 focus:outline-none`}>
      {item.rendered}
    </li>
  );
}

export function App() {
  let [isOpen, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto">
      {/* prettier-ignore */}
      <MenuButton label="Actions" onAction={() => setOpen(true)}>
        <Section>
          <Item key="edit">Edit…</Item>
          <Item key="duplicate">Duplicate</Item>
        </Section>
        <Section>
          <Item key="move">Move…</Item>
          <Item key="rename">Rename…</Item>
        </Section>
        <Section>
          <Item key="archive">Archive</Item>
          <Item key="delete">Delete…</Item>
        </Section>
      </MenuButton>
      <OverlayContainer>
        <AlertDialog
          isOpen={isOpen}
          title="Delete folder"
          confirmLabel="Delete"
          variant="destructive"
          onClose={() => setOpen(false)}>
          Are you sure you want to delete "Documents"? All contents will be
          perminately destroyed.
        </AlertDialog>
      </OverlayContainer>
    </div>
  );
}
