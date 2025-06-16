import { IconCloudDownload, IconMapPinShare } from "@tabler/icons-react";
import { getTurnByTurnMapsUrl } from "../utils/helpers";
import type { TRouteData } from "../utils/types";

interface ActionsProps {
  routeData: TRouteData;
}

function Actions({ routeData }: ActionsProps) {
  return (
    <div className="w-full max-w-md flex justify-between mb-8">
      <a
        className="btn bg-white text-black border-[#e5e5e5] rounded-lg"
        href={routeData?.googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Google Maps
        <IconMapPinShare size={24} stroke={1.5} />
      </a>
      <a
        className="btn bg-white text-black border-[#e5e5e5] rounded-lg"
        href={getTurnByTurnMapsUrl(routeData?.googleMapsUrl)}
        target="_blank"
        rel="noopener noreferrer"
      >
        Turn By Turn
        <IconCloudDownload size={24} stroke={1.5} />
      </a>
    </div>
  );
}

export default Actions;
