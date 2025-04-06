import { Button } from "./ui/button";
import { Range } from '../lib/time-range'

function TimeRangeButton({
    timeRange,
    currentRange,
    setTimeRange
}: {
    timeRange: Range;
    currentRange: Range;
    setTimeRange: (timeRange: Range) => void;
}) {
    return (
        <Button
            className={timeRange == currentRange ? "text-[hsl(12_76%_61%)]" : ""} 
            type="button"
            onClick={() => setTimeRange(timeRange)}
        >
            {timeRange}
        </Button>
    );
}

export { TimeRangeButton };