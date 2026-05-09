import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Worldview, WORLDVIEW_LABELS } from '../../types';

interface WorldviewSelectorProps {
  value: Worldview;
  onChange: (worldview: Worldview) => void;
}

export function WorldviewSelector({ value, onChange }: WorldviewSelectorProps) {
  const handleChange = (_event: React.MouseEvent<HTMLElement>, newValue: Worldview | null) => {
    if (newValue !== null) {
      onChange(newValue);
    }
  };

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      className="mb-4"
    >
      <ToggleButton value="medieval">
        🏰 {WORLDVIEW_LABELS.medieval}
      </ToggleButton>
      <ToggleButton value="cyberpunk">
        🤖 {WORLDVIEW_LABELS.cyberpunk}
      </ToggleButton>
      <ToggleButton value="modern">
        🕵️ {WORLDVIEW_LABELS.modern}
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
