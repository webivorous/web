<template>
  <div class="SubjectSelection">
    <p v-if="mobileMode">Explore our subjects</p>
    <subject-card
      v-for="(card, index) in cards"
      v-bind:key="index"
      :title="card.title"
      :subtitle="card.subtitle"
      :svg="card.svg"
      :topic="card.topic"
      :subtopics="card.subtopics"
      :subtopicDisplayNames="card.subtopicDisplayNames"
      :button-text="card.buttonText"
      :routeTo="card.routeTo"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import SubjectCard from "./SubjectCard";
import MathSVG from "@/assets/subject_icons/math.svg";
import CollegeSVG from "@/assets/subject_icons/college-counseling.svg";
import ScienceSVG from "@/assets/subject_icons/science.svg";

import { topics } from "@/utils/topics";

export default {
  name: "subject-selection",
  components: { SubjectCard },
  data() {
    const svgs = {
      math: MathSVG,
      college: CollegeSVG
    };

    const cards = Object.entries(topics).map(([key, topicObj]) => {
      return {
        title: topicObj.displayName,
        svg: svgs[key],
        topic: key,
        subtopics: Object.keys(topicObj.subtopics).sort(),
        subtopicDisplayNames: Object.entries(topicObj.subtopics)
          .map(([subtopicKey, subtopicObj]) => [
            subtopicKey,
            subtopicObj.displayName
          ])
          .reduce((result, [subtopicKey, displayName]) => {
            result[subtopicKey] = displayName;
            return result;
          }, {})
      };
    });

    cards.push({
      title: "Coming Soon",
      subtitle:
        "Check back soon for new help topics like SAT, ESL, and Science!",
      svg: ScienceSVG,
      buttonText: "Suggest a help topic",
      routeTo: "/contact"
    });

    return { cards };
  },
  computed: {
    ...mapGetters({ mobileMode: "app/mobileMode" })
  }
};
</script>

<style lang="scss" scoped>
.SubjectSelection {
  @include flex-container(column);
  @include child-spacing(top, 16px);

  p {
    @include font-category("heading");
    margin: 0;
    padding: 0;
    text-align: left;
  }

  @include breakpoint-above("medium") {
    @include child-spacing(top, 0);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    gap: 40px;
  }
}
</style>
