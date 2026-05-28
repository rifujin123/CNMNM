import { View } from "react-native";
import { formatMoneyOrNA } from "../../../utils/format";
import { styles } from "./itemDetailStyles";
import InfoRow from "./InfoRow";

export default function ServiceInfoBox({ serviceType, place, locationLabel, availableRoomsCount }) {
  if (serviceType === "hotel") {
    return (
      <View style={styles.infoBox}>
        <InfoRow label="Address" value={place.address_detail || locationLabel} />
        <InfoRow label="Rooms" value={String(place.total_rooms || availableRoomsCount || 0)} />
        <InfoRow label="Base Price" value={formatMoneyOrNA(place.base_price)} />
      </View>
    );
  }

  if (serviceType === "transport") {
    return (
      <View style={styles.infoBox}>
        <InfoRow label="Brand" value={place.brand_name || "N/A"} />
        <InfoRow label="Seats" value={String(place.total_seats || 0)} />
      </View>
    );
  }

  return null;
}
