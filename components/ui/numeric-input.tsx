import React, { useState, useRef, ChangeEvent, useEffect } from "react"
import { Input } from "./input"
import { formatNumberWithCommas, parseNumberFromCommas } from "@/lib/utils"

interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number
  onChange: (value: number) => void
  placeholder?: string
}

export function NumericInput({ value, onChange, placeholder, ...props }: NumericInputProps) {
  const [displayValue, setDisplayValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const lastCaretPosition = useRef<number>(0)

  // Update display value when prop value changes
  useEffect(() => {
    setDisplayValue(value ? formatNumberWithCommas(value) : "")
  }, [value])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target
    const currentPosition = input.selectionStart || 0
    const previousValue = displayValue
    
    // Only allow digits and commas
    const cleaned = input.value.replace(/[^\d,]/g, "")
    // Remove existing commas for processing
    const digitsOnly = cleaned.replace(/,/g, "")
    
    if (digitsOnly) {
      const number = parseInt(digitsOnly, 10)
      const formatted = formatNumberWithCommas(number)
      const commasBefore = (previousValue.slice(0, currentPosition).match(/,/g) || []).length
      const commasAfter = (formatted.slice(0, currentPosition).match(/,/g) || []).length
      const commaDiff = commasAfter - commasBefore
      
      setDisplayValue(formatted)
      onChange(number)
      lastCaretPosition.current = currentPosition + commaDiff

      // Maintain cursor position
      requestAnimationFrame(() => {
        if (inputRef.current) {
          const newPosition = Math.min(lastCaretPosition.current, formatted.length)
          inputRef.current.setSelectionRange(newPosition, newPosition)
        }
      })
    } else {
      setDisplayValue("")
      onChange(0)
      lastCaretPosition.current = 0
    }
  }

  return (
    <Input
      {...props}
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      onKeyUp={(e) => {
        // Store the current position after any key press
        lastCaretPosition.current = e.currentTarget.selectionStart || 0
      }}
    />
  )
}