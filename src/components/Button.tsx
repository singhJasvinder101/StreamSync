import React, { ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'gradient'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        return (
            <button
                style={{borderRadius: '1rem'}}
                className={
                    `inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
                    ${variant === 'default'} bg-primary text-primary-foreground hover:bg-primary/90",
                    ${variant === 'gradient'} bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white",
                    h-10 px-3 block mx-auto py-2 rounded-2xl transition-all duration-300 transform hover:scale-105 ${className}`}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }