import {
  faCircleXmark,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export default function AlertErro({
  message,
  open,
  onClose,
  scrollToBottom,
}: {
  message: string;
  open: boolean;
  onClose?: () => void;
  scrollToBottom?: boolean;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsOpen(open);
    if (open && scrollToBottom) {
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 200);
    }
  }, [open]);

  return (
    <>
      {isOpen && (
        <div
          role="alert"
          className="alert alert-error bg-opacity-80 shadow-lg text-white flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-xl" />
            <span>{message}</span>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              if (onClose) onClose();
            }}
            title="Fechar alerta"
            className="btn btn-sm btn-circle btn-outline border-white hover:bg-white hover:text-error transition-all self-start"
          >
            <FontAwesomeIcon icon={faCircleXmark} className="text-base" />
          </button>
        </div>
      )}
    </>
  );
}
