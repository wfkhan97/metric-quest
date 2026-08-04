type ProgressBarProps = {
  label: string;
  completed: number;
  total: number;
};

export function ProgressBar({ label, completed, total }: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const summary = `${completed} of ${total} missions complete`;

  return (
    <div className="progress-bar">
      <div className="progress-bar-heading">
        <span>{label}</span>
        <span>{summary}</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${summary}, ${percent} percent`}
      >
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
