import { useState } from "react";

type DebtorModalState = {
  mode: "add" | "edit";
  debtor?: {
    id: number;
    name: string;
    description: string | null;
    phoneNumber: string | null;
  };
};

export function useDebtorModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [state, setState] = useState<DebtorModalState>({ mode: "add" });

  const openAddDebtor = () => {
    setState({ mode: "add" });
    setIsVisible(true);
  };

  const openEditDebtor = (debtor: DebtorModalState["debtor"]) => {
    setState({ mode: "edit", debtor });
    setIsVisible(true);
  };

  const closeModal = () => setIsVisible(false);

  return {
    isVisible,
    mode: state.mode,
    debtor: state.debtor,
    openAddDebtor,
    openEditDebtor,
    closeModal,
  };
}
