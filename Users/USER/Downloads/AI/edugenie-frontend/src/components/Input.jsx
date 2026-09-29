import React, { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(({
    label,
    error,
    helperText,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    disabled = false,
    required = false,
    icon: Icon = null,
    className = '',
    rows = 4,
    options = [], // for select type
    ...props
}, ref) => {
    const isTextarea = type === 'textarea';
    const isSelect = type === 'select';

    return (
        <div className={`input-group ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''} ${className}`}>
            {label && (
                <label className="input-label" htmlFor={name}>
                    {label}
                    {required && <span className="required-star">*</span>}
                </label>
            )}

            <div className="input-wrapper">
                {Icon && (
                    <span className="input-icon">
                        <Icon size={18} />
                    </span>
                )}

                {isTextarea ? (
                    <textarea
                        ref={ref}
                        id={name}
                        name={name}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        disabled={disabled}
                        required={required}
                        rows={rows}
                        className={`form-control ${Icon ? 'with-icon' : ''}`}
                        {...props}
                    />
                ) : isSelect ? (
                    <select
                        ref={ref}
                        id={name}
                        name={name}
                        value={value}
                        onChange={onChange}
                        disabled={disabled}
                        required={required}
                        className={`form-control ${Icon ? 'with-icon' : ''}`}
                        {...props}
                    >
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        ref={ref}
                        type={type}
                        id={name}
                        name={name}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        disabled={disabled}
                        required={required}
                        className={`form-control ${Icon ? 'with-icon' : ''}`}
                        {...props}
                    />
                )}
            </div>

            {error && <span className="input-error-msg">{error}</span>}
            {!error && helperText && <span className="input-helper-msg">{helperText}</span>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
