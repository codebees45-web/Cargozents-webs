import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const FormInput = ({ label, type = 'text', value, onChange, name, placeholder, required = true }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <label className="block relative">
      <span className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">{label}</span>
      <input
        type={inputType}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="mt-1.5 w-full rounded-lg border border-primary/15 bg-secondary/40 px-4 py-2.5 text-sm text-primary placeholder:text-muted/40 outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/40 pr-10"
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[28px] text-gray-400 hover:text-primary transition-colors"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      )}
    </label>
  );
};

export default FormInput;
