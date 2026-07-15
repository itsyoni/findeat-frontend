import AppBottomSheet from "@/components/common/AppBottomSheet";
import type { ReportTargetType } from "@findeat/types";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import ReportForm from "./ReportForm";

type Props = {
  open: boolean;
  targetType: ReportTargetType;
  targetId: string;
  onClose: () => void;
};

export default function ReportBottomSheet({
  open,
  targetType,
  targetId,
  onClose,
}: Props) {
  return (
    <AppBottomSheet open={open} onClose={onClose} snapPoints={["68%"]}>
      <BottomSheetView className="flex-1 pt-1">
        {open ? (
          <ReportForm
            key={`${targetType}:${targetId}`}
            targetType={targetType}
            targetId={targetId}
            onCancel={onClose}
            onDone={onClose}
          />
        ) : null}
      </BottomSheetView>
    </AppBottomSheet>
  );
}
