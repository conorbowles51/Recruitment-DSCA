import React from 'react'

const Button = ({
    color,
    text
}) => {
  return (
    <button className={`${color}`}>
        {text}
    </button>
  )
}

export default Button