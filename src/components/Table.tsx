import type { TRouteData, TStop } from "../utils/types";
import TableData from "./TableData";

interface TableProps {
  routeData: TRouteData;
  startDate: string;
}

function Table({ routeData, startDate }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-lg bg-base-100 shadow-xl">
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th className="hidden md:table-cell">Date</th>
            <th>Departure Point</th>
            <th>Arrival Point</th>
            <th className="hidden md:table-cell">Lenght of Rest</th>
            <th>Approx. Mileage</th>
          </tr>
        </thead>
        <tbody>
          {routeData?.stops
            .slice(0, routeData?.stops.length - 1)
            .map((stop: TStop, index: number) => {
              const arrivalStop = routeData.stops[index + 1];

              const [year, month, day] = startDate.split("-").map(Number);
              const initialDepartureDate = new Date(year, month - 1, day);
              initialDepartureDate.setHours(0, 0, 0, 0);

              const daysToAdd = Math.ceil(
                parseFloat(stop.distanceFromStart.toString()) / 500
              );

              const currentSegmentDate = new Date(initialDepartureDate);
              currentSegmentDate.setDate(
                initialDepartureDate.getDate() + daysToAdd
              );

              const formattedDate = currentSegmentDate
                .toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                .replace(/,/, "");

              return (
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <th className="py-3 px-4 text-sm text-gray-900">
                    {index + 1}
                  </th>
                  <TableData hideOnMobile={true}>{formattedDate}</TableData>
                  <TableData>{stop.address}</TableData>
                  <TableData>{arrivalStop.address}</TableData>
                  <TableData hideOnMobile={true}>8 hours</TableData>
                  <TableData>
                    {arrivalStop.actualDistanceAdded.toFixed(0)} mi
                  </TableData>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
