import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { addTourComment, fetchTourComments } from "../../api/services";
import { useAuth } from "../../../context/AuthContext";
import { commonStyles, tokens } from "../../styles/commonStyles";

const { colors, radius, fontWeights } = tokens;

export default function RatingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token, isLoggedIn, user } = useAuth();

  const { serviceId, serviceType, serviceName, starRating } = route.params;
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const data = await fetchTourComments({ tourId: serviceId, token });
      setComments(data);
    } catch (err) {
      console.error("Fetch comments error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (serviceType === "tour") loadComments();
  }, [serviceId, serviceType, token]);

  const myComment = comments.find(
    (comment) => String(comment.user_id) === String(user?.id),
  );
  const reviewList = myComment
    ? [myComment, ...comments.filter((comment) => comment.id !== myComment.id)]
    : comments;

  const submitComment = async () => {
    if (!isLoggedIn) {
      navigation.navigate("Login");
      return;
    }

    if (!content.trim()) {
      Alert.alert("Missing comment", "Please enter your comment.");
      return;
    }

    try {
      setIsSubmitting(true);
      await addTourComment({ tourId: serviceId, token, content: content.trim(), rating });

      setContent("");
      setRating(5);
      await loadComments();
    } catch (err) {
      console.error("Submit comment error:", err);
      Alert.alert("Cannot submit review", "Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.tabScreen}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Reviews</Text>
      </View>

      <ScrollView contentContainerStyle={commonStyles.tabContent}>
        <View style={styles.serviceSummary}>
          <Text style={styles.serviceName}>{serviceName}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={18} color={colors.warning} />
            <Text style={styles.mutedText}>{starRating} - Current rating</Text>
          </View>
        </View>

        {serviceType === "tour" ? (
          <>
            {!myComment && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Write review</Text>
                <View style={styles.starPicker}>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Pressable key={item} onPress={() => setRating(item)}>
                      <Ionicons
                        name={item <= rating ? "star" : "star-outline"}
                        size={28}
                        color={colors.warning}
                      />
                    </Pressable>
                  ))}
                </View>
                <TextInput
                  value={content}
                  onChangeText={setContent}
                  placeholder="Write your comment"
                  multiline
                  style={styles.textArea}
                />
                <Pressable
                  disabled={isSubmitting}
                  style={[commonStyles.formButton, isSubmitting && commonStyles.disabled]}
                  onPress={submitComment}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={commonStyles.formButtonText}>Submit</Text>
                  )}
                </Pressable>
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Review list</Text>
              {isLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : reviewList.length > 0 ? (
                reviewList.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {(comment.username || "?")[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.commentBody}>
                      <Text style={styles.username}>{comment.username}</Text>
                      <View style={styles.commentStars}>
                        {[1, 2, 3, 4, 5].map((item) => (
                          <Ionicons
                            key={item}
                            name={item <= comment.rating ? "star" : "star-outline"}
                            size={13}
                            color={colors.warning}
                          />
                        ))}
                      </View>
                      <Text style={styles.commentText}>{comment.content}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.mutedText}>No reviews yet.</Text>
              )}
            </View>
          </>
        ) : (
          <View style={styles.card}>
            <Text style={styles.mutedText}>Reviews are available for tours only.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceSummary: {
    marginBottom: 16,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: fontWeights.extraBold,
    color: colors.text,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: fontWeights.extraBold,
    color: colors.text,
    marginBottom: 12,
  },
  mutedText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  starPicker: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 12,
    color: colors.text,
    textAlignVertical: "top",
  },
  commentItem: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: fontWeights.extraBold,
    color: colors.primary,
  },
  commentBody: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  commentStars: {
    flexDirection: "row",
    gap: 2,
    marginTop: 4,
  },
  commentText: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
