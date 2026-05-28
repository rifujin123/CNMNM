import { ScrollView, View } from "react-native";
import { styles } from "./itemDetail/itemDetailStyles";
import { useItemDetail } from "../../hooks/useItemDetail";
import DetailState from "./itemDetail/DetailState";
import ItemDetailHero from "./itemDetail/ItemDetailHero";
import ItemDetailHeader from "./itemDetail/ItemDetailHeader";
import ServiceInfoBox from "./itemDetail/ServiceInfoBox";
import TourOptions from "./itemDetail/TourOptions";
import HotelOptions from "./itemDetail/HotelOptions";
import TransportOptions from "./itemDetail/TransportOptions";
import BottomBookingBar from "./itemDetail/BottomBookingBar";

export default function ItemDetailScreen() {
  const detail = useItemDetail();

  if (detail.isLoading || !detail.place) {
    return (
      <DetailState
        isLoading={detail.isLoading}
        serviceLabel={detail.serviceLabel}
        onGoBack={detail.onBack}
      />
    );
  }

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <ItemDetailHero imageUri={detail.imageUri} onBack={detail.onBack} />
        </View>

        <ItemDetailHeader
          place={detail.place}
          serviceLabel={detail.serviceLabel}
          locationLabel={detail.locationLabel}
          onOpenRatings={detail.onOpenRatings}
        />

        <ServiceInfoBox
          serviceType={detail.serviceType}
          place={detail.place}
          locationLabel={detail.locationLabel}
          availableRoomsCount={detail.availableRooms.length}
        />

        {detail.serviceType === "tour" ? (
          <TourOptions
            packages={detail.packages}
            selectedPackageId={detail.selectedPackageId}
            onSelectPackage={detail.onSelectPackage}
          />
        ) : null}

        {detail.serviceType === "hotel" ? (
          <HotelOptions
            rooms={detail.availableRooms}
            selectedRoomId={detail.selectedRoomId}
            onSelectRoom={detail.onSelectRoom}
          />
        ) : null}

        {detail.serviceType === "transport" ? (
          <TransportOptions
            routes={detail.routes}
            selectedRoute={detail.selectedRoute}
            selectedRouteId={detail.selectedRouteId}
            selectedSeatTypeId={detail.selectedSeatTypeId}
            seatTypeOptions={detail.seatTypeOptions}
            basePrice={detail.place.base_price}
            onSelectRoute={detail.onSelectRoute}
            onSelectSeatType={detail.onSelectSeatType}
          />
        ) : null}

        <View style={styles.bottomSpace} />
      </ScrollView>

      <BottomBookingBar
        selectedPrice={detail.selectedPrice}
        canBook={detail.canBook}
        onBookNow={detail.onBookNow}
      />
    </View>
  );
}