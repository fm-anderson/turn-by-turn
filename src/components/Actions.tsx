import { IconCloudDownload, IconMapPinShare } from "@tabler/icons-react";
import { getTurnByTurnMapsUrl } from "../utils/helpers";
import type { TRouteData } from "../utils/types";

interface ActionsProps {
  routeData: TRouteData;
}

function Actions({ routeData }: ActionsProps) {
  return (
    <div className="w-full max-w-md bg-base-100 p-6 rounded-lg shadow-md mb-8">
      <div className="w-full max-w-md flex justify-between">
        <a
          className="btn"
          href={routeData?.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Maps
          <IconMapPinShare size={24} stroke={1.5} />
        </a>
        <a
          className="btn"
          href={getTurnByTurnMapsUrl(routeData?.googleMapsUrl)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Turn By Turn
          <IconCloudDownload size={24} stroke={1.5} />
        </a>
      </div>
    </div>
  );
}

export default Actions;
