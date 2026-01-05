import clsx from "clsx";
import { useTranslation } from "react-i18next";

interface EndToEndEncryptionProps {
  className?: string;
  isCompact?: boolean;
}

export function EndToEndEncryption({
  className,
  isCompact = false,
}: EndToEndEncryptionProps) {
  const { t } = useTranslation();

  return (
    <div
      title={isCompact ? t("encryption.description") : ""}
      className={clsx(
        "flex items-center cursor-help",
        "group  hover:text-(--primary-green-glow)",
        className,
        {
          "absolute bottom-5 left-1/2 -translate-x-1/2 text-(--primary-green)":
            isCompact,
        }
      )}
    >
      {isCompact ? (
        <>
          <span className="material-symbols-outlined text-xl!">
            shield_lock
          </span>
          <h1 className="truncate text-sm mx-0.5">{t("encryption.title")}</h1>
          <span className="material-symbols-outlined text-xl!">
            shield_lock
          </span>
        </>
      ) : (
        <div className="flex gap-1">
          <span className="material-symbols-outlined text-5xl!">
            shield_lock
          </span>

          <div className="">
            <h1 className="truncate font-semibold">{t("encryption.title")}</h1>

            <h2
              className={clsx(
                "text-xs opacity-70"
                // "hidden group-hover:block max-w-32!"
              )}
            >
              {t("encryption.description")}
            </h2>
          </div>
        </div>
      )}
    </div>
  );
}
