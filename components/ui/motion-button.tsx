'use client'
import { FC } from 'react'
import { ArrowLeft } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: unknown[]) { return twMerge(clsx(inputs)) }

interface Props {
  label: string
  classes?: string
  onClick?: () => void
}

const MotionButton: FC<Props> = ({ label, classes, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'bg-background group relative h-auto w-36 cursor-pointer rounded-full border-[none] p-1 outline-none',
        classes
      )}
    >
      <span
        className='circle bg-primary m-0 block h-12 w-12 overflow-hidden rounded-full duration-500 group-hover:w-full'
        aria-hidden='true'
      />
      <div className='icon absolute top-1/2 left-4 translate-x-0 -translate-y-1/2 duration-500 group-hover:translate-x-[0.4rem]'>
        <ArrowLeft className='text-background size-6' />
      </div>
      <span className='button-text text-foreground group-hover:text-background font-manrope absolute top-2/4 left-2/4 ml-4 -translate-x-2/4 -translate-y-2/4 text-center text-lg font-medium tracking-tight whitespace-nowrap duration-500'>
        {label}
      </span>
    </button>
  )
}

export default MotionButton