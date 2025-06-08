import React from 'react'
import pkg from '../package.json'
import { ThemeToggler } from './ThemeToggler'

const Footer = () => {
    return (
      <div className='flex flex-col sm:flex-row items-center justify-between w-full px-2 sm:px-4 gap-4 sm:gap-0'>
        <a href="#/" className="flex items-center gap-2 text-2xl sm:text-3xl font-semibold">
            DutyDrive
        </a>
        <div className='flex items-center gap-2 justify-end'>
            <ThemeToggler />
            <div className="flex flex-col items-end p-2 sm:p-4">
                <small className="text-xs font-semibold text-gray-400">
                    {new Date().getFullYear()} © Yasas Hansaka Thenuwara
                </small>
                <small>
                    <span className="text-xs font-semibold text-gray-400">version {pkg.version}</span>
                </small>
            </div>
        </div>
      </div>
    )
}

export default Footer