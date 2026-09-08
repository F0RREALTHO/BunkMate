import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowUpAZ, ArrowDownZA, Check, GraduationCap, XOctagon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styles from './SortDropdown.module.css';

export type SortOption = 'default' | 'pct-asc' | 'pct-desc' | 'attended-desc' | 'missed-desc';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { id: 'default', label: 'Default Order', icon: Minus },
    { id: 'pct-asc', label: 'Attendance (Low to High)', icon: TrendingDown },
    { id: 'pct-desc', label: 'Attendance (High to Low)', icon: TrendingUp },
    { id: 'attended-desc', label: 'Most Classes Attended', icon: GraduationCap },
    { id: 'missed-desc', label: 'Most Classes Missed', icon: XOctagon },
  ];

  const selectedOption = options.find(o => o.id === value) || options[0];

  return (
    <div className={styles.dropdownContainer} ref={ref}>
      <button 
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={styles.triggerContent}>
          <span className={styles.label}>Sort:</span>
          <span className={styles.value}>{selectedOption.label}</span>
        </span>
        <ChevronDown size={14} className={`${styles.chevron} ${isOpen ? styles.open : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={styles.menu}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {options.map((option) => {
              const Icon = option.icon;
              const isSelected = option.id === value;
              return (
                <button
                  key={option.id}
                  className={`${styles.item} ${isSelected ? styles.selected : ''}`}
                  onClick={() => {
                    onChange(option.id as SortOption);
                    setIsOpen(false);
                  }}
                >
                  <div className={styles.itemLeft}>
                    <Icon size={16} className={styles.itemIcon} />
                    <span>{option.label}</span>
                  </div>
                  {isSelected && <Check size={16} className={styles.checkIcon} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
