import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const FormInput = ({ label, type = 'text', value, onChange, name, placeholder, required = true, error }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <label className="block">
      <span className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">{label}</span>
      <div className="relative mt-1.5">
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition ${isPassword ? 'pr-10' : ''} ${
            error
              ? 'border-danger/60 bg-danger/5 text-danger placeholder:text-danger/40 focus:border-danger focus:ring-1 focus:ring-danger/40'
              : 'border-primary/15 bg-secondary/40 text-primary placeholder:text-muted/40 focus:border-primary/60 focus:ring-1 focus:ring-primary/40'
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors flex items-center justify-center"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
    </label>
  );
};

export default FormInput;
