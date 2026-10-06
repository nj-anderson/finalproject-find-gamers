import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import "../styles/FilterSelect.css";

function FilterSelect({ value, onChange, options }) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const selectedOption =
        options.find((option) => option.value === value) || options[0];

    return (
        <div className="filter-select" ref={dropdownRef}>
            <button
                type="button"
                className={`filter-select-button ${
                    open ? "filter-select-open" : ""
                }`}
                onClick={() => setOpen(!open)}
            >
                <span>{selectedOption.label}</span>

                <ChevronDown
                    size={18}
                    className={`filter-chevron ${
                        open ? "filter-chevron-open" : ""
                    }`}
                />
            </button>

            {open && (
                <div className="filter-options">
                    {options.map((option) => (
                        <button
                            type="button"
                            key={option.value}
                            className={`filter-option ${
                                option.value === value
                                    ? "filter-option-selected"
                                    : ""
                            }`}
                            onClick={() => {
                                onChange(option.value);
                                setOpen(false);
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FilterSelect;