import { useEffect, useRef } from "react";

export function useWhyDidYouUpdate(name: string, props: Record<string, unknown>) {
  const previousProps = useRef<Record<string, unknown> | undefined>(undefined);

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = new Set([
        ...Object.keys(previousProps.current),
        ...Object.keys(props),
      ]);
      const changes: Record<string, { from: unknown; to: unknown }> = {};

      allKeys.forEach((key) => {
        if (previousProps.current?.[key] !== props[key]) {
          changes[key] = {
            from: previousProps.current?.[key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changes).length) {
        console.log("[Re-render]", name, changes);
      }
    }

    previousProps.current = props;
  });
}
