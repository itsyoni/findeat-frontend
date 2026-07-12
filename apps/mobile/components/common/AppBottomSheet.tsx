import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFooterProps,
} from "@gorhom/bottom-sheet";
import { ReactNode, useCallback } from "react";

type Props = {
  open: boolean;
  snapPoints?: string[];
  onClose: () => void;
  children: ReactNode;
  footerComponent?: (
    props: BottomSheetFooterProps,
  ) => React.ReactElement | null;
};

export default function AppBottomSheet({
  open,
  onClose,
  children,
  footerComponent,
  snapPoints,
}: Props) {
  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.45}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        style={{
          backgroundColor: "#fff",
        }}
      />
    ),
    [],
  );

  if (!open) return null;

  return (
    <BottomSheet
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      enableContentPanningGesture
      enableHandlePanningGesture
      onClose={onClose}
      backdropComponent={renderBackdrop}
      footerComponent={footerComponent}
      backgroundStyle={{
        backgroundColor: "white",
      }}
    >
      {children}
    </BottomSheet>
  );
}
