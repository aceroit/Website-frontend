'use client'

import React, { useRef, useState } from 'react'
import ReactSelect, { 
  Props as SelectProps, 
  components,
  GroupBase,
  StylesConfig,
  MenuPlacement
} from 'react-select'
import { ChevronDownIcon, CheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CustomSelectOption {
  value: string
  label: string
  isDisabled?: boolean
}

interface CustomSelectProps extends Omit<SelectProps<CustomSelectOption, false, GroupBase<CustomSelectOption>>, 'options' | 'value' | 'onChange'> {
  options: CustomSelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  size?: 'sm' | 'default'
  className?: string
  /** When true, className is applied to a wrapper and the control has no border (single border, fixes double-border look) */
  wrapWithClassName?: boolean
}

export function CustomSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Select...',
  size = 'default',
  className,
  wrapWithClassName = false,
  ...props
}: CustomSelectProps) {
  const selectedOption = options.find(opt => opt.value === value)
  const [menuOpen, setMenuOpen] = useState(false)
  const openedAtRef = useRef<number | null>(null)

  const customStyles: StylesConfig<CustomSelectOption, false> = {
    control: (base, state) => ({
      ...base,
      minHeight: size === 'sm' ? '32px' : '36px',
      height: size === 'sm' ? '32px' : '36px',
      borderRadius: '0.375rem',
      ...(wrapWithClassName ? { border: 'none', boxShadow: 'none' } : {}),
      borderColor: wrapWithClassName ? 'transparent' : (state.isFocused 
        ? 'var(--color-ring)' 
        : 'var(--color-input)'),
      backgroundColor: 'transparent',
      boxShadow: wrapWithClassName ? 'none' : (state.isFocused 
        ? '0 0 0 3px rgba(113, 113, 122, 0.1)' 
        : 'none'),
      transition: 'all 0.2s',
      cursor: 'pointer',
      // Remove border when menu is open (only when not wrapWithClassName)
      ...(!wrapWithClassName && state.menuIsOpen && {
        borderColor: 'transparent',
        boxShadow: 'none',
      }),
      '&:hover': {
        borderColor: state.menuIsOpen ? 'transparent' : (wrapWithClassName ? 'transparent' : 'var(--color-ring)'),
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 12px',
      height: size === 'sm' ? '32px' : '36px',
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
      color: 'var(--color-foreground)',
    }),
    singleValue: (base) => ({
      ...base,
      color: 'var(--color-foreground)',
      fontSize: '0.875rem',
      lineHeight: 1,
    }),
    placeholder: (base) => ({
      ...base,
      color: 'var(--color-muted-foreground)',
      fontSize: '0.875rem',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      padding: '0 8px',
      color: 'var(--color-muted-foreground)',
      opacity: 0.5,
      transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.2s',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'var(--color-popover)',
      border: '1px solid var(--color-border)',
      borderRadius: '0.375rem',
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      zIndex: 9999,
      marginTop: '4px',
      overflow: 'hidden',
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menuList: (base) => ({
      ...base,
      padding: '4px',
      maxHeight: '300px',
      // Hide scrollbar
      scrollbarWidth: 'none', // Firefox
      msOverflowStyle: 'none', // IE and Edge
      '::-webkit-scrollbar': {
        display: 'none', // Chrome, Safari, Opera
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused 
        ? 'var(--color-accent)' 
        : 'transparent',
      color: state.isFocused
        ? 'var(--color-accent-foreground)'
        : 'var(--color-foreground)',
      cursor: state.isDisabled ? 'not-allowed' : 'pointer',
      fontSize: '0.875rem',
      padding: '6px 32px 6px 8px',
      position: 'relative',
      borderRadius: '0.25rem',
      opacity: state.isDisabled ? 0.5 : 1,
      ':active': {
        backgroundColor: state.isDisabled 
          ? 'transparent' 
          : 'var(--color-accent)',
      },
    }),
  }

  const Control = (controlProps: any) => (
    <components.Control
      {...controlProps}
      onMouseDown={(e: React.MouseEvent) => {
        setMenuOpen((prev) => {
          if (!prev) openedAtRef.current = Date.now()
          return !prev
        })
        controlProps.innerProps?.onMouseDown?.(e)
      }}
    />
  )

  const DropdownIndicator = (props: any) => {
    return (
      <components.DropdownIndicator {...props}>
        <ChevronDownIcon className="size-4" />
      </components.DropdownIndicator>
    )
  }

  const Option = (props: any) => {
    return (
      <components.Option {...props}>
        <div className="flex items-center justify-between w-full">
          <span>{props.children}</span>
          {props.isSelected && (
            <CheckIcon className="size-4 absolute right-2" />
          )}
        </div>
      </components.Option>
    )
  }

  const handleMenuOpen = () => {
    openedAtRef.current = Date.now()
    setMenuOpen(true)
  }

  const handleMenuClose = () => {
    const openedAt = openedAtRef.current
    if (openedAt != null && Date.now() - openedAt < 250) {
      return
    }
    openedAtRef.current = null
    setMenuOpen(false)
  }

  const selectElement = (
    <ReactSelect<CustomSelectOption>
      {...props}
      options={options}
      value={selectedOption}
      onChange={(option) => {
        if (option && onValueChange) {
          onValueChange(option.value)
        }
      }}
      placeholder={placeholder}
      styles={customStyles}
      components={{
        Control,
        DropdownIndicator,
        Option,
      }}
      className={cn('react-select-container', !wrapWithClassName && className)}
      classNamePrefix="react-select"
      menuPlacement="auto"
      menuPosition="fixed"
      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      menuIsOpen={menuOpen}
      onMenuOpen={handleMenuOpen}
      onMenuClose={handleMenuClose}
      isSearchable={false}
      // Prevent body scroll on mobile
      closeMenuOnScroll={(e) => {
        return e.target === document
      }}
    />
  )

  if (wrapWithClassName) {
    return <div className={className}>{selectElement}</div>
  }

  return selectElement
}
