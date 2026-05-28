import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { fetchPlaceDetail } from "../api/services";
import { useAuth } from "../../context/AuthContext";
import {
  formatMoneyOrNA,
  getCityName,
  isPastDate,
  SERVICE_LABELS,
  toNumber,
} from "../utils/format";

const FALLBACK_IMAGE_URI =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80";

const getImageUri = (item) => item?.image || item?.images?.[0]?.image;

export const useItemDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { isLoggedIn } = useAuth();

  const itemId = route.params?.itemId ?? route.params?.ItemId;
  const serviceType = route.params?.serviceType;
  const serviceLabel = SERVICE_LABELS[serviceType];

  const [place, setPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPackageId, setSelectedPackageId] = useState(
    route.params?.selectedPackageId ?? null
  );
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [selectedSeatTypeId, setSelectedSeatTypeId] = useState(null);

  const packages = place?.tour_package ?? [];
  const availableRooms = useMemo(
    () => (place?.rooms ?? []).filter((room) => room.is_available !== false),
    [place?.rooms]
  );
  const routes = place?.routes ?? [];

  const seatTypeOptions = useMemo(() => {
    const seatTypes = place?.seat_types ?? [];
    const availability = place?.availability ?? [];

    return seatTypes.map((seatType) => {
      const row = availability.find(
        (item) =>
          String(item.route) === String(selectedRouteId) &&
          String(item.seat_type) === String(seatType.id)
      );

      return {
        ...seatType,
        availableSeats: row?.available_seats ?? 0,
      };
    });
  }, [place?.availability, place?.seat_types, selectedRouteId]);

  useEffect(() => {
    let active = true;

    const loadDetail = async () => {
      try {
        setIsLoading(true);
        const data = await fetchPlaceDetail(itemId, serviceType);
        if (active) setPlace(data);
      } catch (err) {
        console.error("Fetch place detail error:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    if (itemId) loadDetail();

    return () => {
      active = false;
    };
  }, [itemId, serviceType]);

  useEffect(() => {
    if (place?.tour_package?.length > 0 && !selectedPackageId) {
      setSelectedPackageId(place.tour_package[0].id);
    }

    if (serviceType === "hotel") {
      setSelectedRoomId((current) => {
        const hasCurrent = availableRooms.some(
          (room) => String(room.id) === String(current)
        );
        return hasCurrent ? current : availableRooms[0]?.id ?? null;
      });
      return;
    }

    if (serviceType === "transport") {
      setSelectedRouteId((current) => {
        const hasCurrent = routes.some((item) => String(item.id) === String(current));
        return hasCurrent ? current : routes[0]?.id ?? null;
      });
    }
  }, [availableRooms, packages, place, routes, serviceType, selectedPackageId]);

  useEffect(() => {
    if (serviceType !== "transport") return;

    setSelectedSeatTypeId((current) => {
      const hasCurrent = seatTypeOptions.some(
        (seatType) =>
          String(seatType.id) === String(current) && seatType.availableSeats > 0
      );

      if (hasCurrent) return current;

      return (
        seatTypeOptions.find((seatType) => seatType.availableSeats > 0)?.id ??
        seatTypeOptions[0]?.id ??
        null
      );
    });
  }, [seatTypeOptions, serviceType]);

  const selectedPackage = packages.find(
    (pkg) => String(pkg.id) === String(selectedPackageId)
  );
  const selectedRoom = availableRooms.find(
    (room) => String(room.id) === String(selectedRoomId)
  );
  const selectedRoute = routes.find(
    (item) => String(item.id) === String(selectedRouteId)
  );
  const selectedSeatType = seatTypeOptions.find(
    (seatType) => String(seatType.id) === String(selectedSeatTypeId)
  );

  const selectedPrice = useMemo(() => {
    if (serviceType === "tour") {
      return selectedPackage
        ? formatMoneyOrNA(selectedPackage.total_price)
        : place?.base_price_display || formatMoneyOrNA(place?.base_price);
    }

    if (serviceType === "hotel") {
      return formatMoneyOrNA(selectedRoom?.room_type?.price ?? place?.base_price);
    }

    if (serviceType === "transport") {
      const total = toNumber(place?.base_price) + toNumber(selectedSeatType?.price);
      return formatMoneyOrNA(total);
    }

    return formatMoneyOrNA(place?.base_price);
  }, [place?.base_price, place?.base_price_display, selectedPackage, selectedRoom, selectedSeatType, serviceType]);

  const isServiceInactive = place?.is_active === false;
  const isTourSoldOut = serviceType === "tour" && Number(place?.empty_slot ?? 0) <= 0;
  const isTourExpired = serviceType === "tour" && isPastDate(place?.time_start);
  const isUnavailable = isServiceInactive || isTourSoldOut || isTourExpired;

  const canBook =
    !isUnavailable &&
    ((serviceType === "tour" && Boolean(selectedPackage)) ||
      (serviceType === "hotel" && Boolean(selectedRoom)) ||
      (serviceType === "transport" &&
        Boolean(selectedRoute) &&
        Boolean(selectedSeatType) &&
        selectedSeatType.availableSeats > 0));

  const handleOpenRatings = () => {
    navigation.navigate("RatingScreen", {
      serviceId: place.id,
      serviceType,
      serviceName: place.name,
      starRating: place.star_rating,
    });
  };

  const handleBookNow = () => {
    if (!isLoggedIn) {
      navigation.navigate("Login");
      return;
    }

    if (!place || !canBook) {
      Alert.alert(
        `Choose ${serviceLabel.toLowerCase()} option`,
        "Please choose an available option before booking."
      );
      return;
    }

    const params = {
      service: { ...place, type: serviceType },
      serviceType,
      quantity: 1,
    };

    if (serviceType === "tour") params.selectedPackage = selectedPackage;
    if (serviceType === "hotel") params.selectedRoom = selectedRoom;
    if (serviceType === "transport") {
      params.selectedRoute = selectedRoute;
      params.selectedSeatType = selectedSeatType;
    }

    navigation.navigate("BookingCheckout", params);
  };

  return {
    place,
    isLoading,
    serviceType,
    serviceLabel,
    packages,
    availableRooms,
    routes,
    seatTypeOptions,
    selectedPackageId,
    selectedRoomId,
    selectedRoute,
    selectedRouteId,
    selectedSeatTypeId,
    selectedPrice,
    canBook,
    imageUri: getImageUri(place) || FALLBACK_IMAGE_URI,
    locationLabel: getCityName(place),
    onBack: navigation.goBack,
    onOpenRatings: handleOpenRatings,
    onBookNow: handleBookNow,
    onSelectPackage: setSelectedPackageId,
    onSelectRoom: setSelectedRoomId,
    onSelectRoute: setSelectedRouteId,
    onSelectSeatType: setSelectedSeatTypeId,
  };
};
