import {
  BottomSheetBackdrop,
  BottomSheetFooterProps,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { ReactNode, useCallback, useEffect, useRef } from "react";
import { useAppTheme } from "@/contexts/ThemeContext";

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
  if (!open) return null;

  return (
    <PresentedBottomSheet
      onClose={onClose}
      footerComponent={footerComponent}
      snapPoints={snapPoints}
    >
      {children}
    </PresentedBottomSheet>
  );
}

function PresentedBottomSheet({
  onClose,
  children,
  footerComponent,
  snapPoints,
}: Omit<Props, "open">) {
  const { isDark } = useAppTheme();
  const modalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      modalRef.current?.present();
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.45}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        style={{
          backgroundColor: isDark ? "#000" : "#fff",
        }}
      />
    ),
    [isDark],
  );

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      enableContentPanningGesture
      enableHandlePanningGesture
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      footerComponent={footerComponent}
      backgroundStyle={{
        backgroundColor: isDark ? "#111827" : "white",
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? "#6B7280" : "#D1D5DB",
      }}
    >
      {children}
    </BottomSheetModal>
  );
}
