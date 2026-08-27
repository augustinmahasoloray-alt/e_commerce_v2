import Hero from "../components/layout/Hero";
import Discovery from "../components/home/Discovery";
import Categories from "../components/home/Categories";
import FeaturedCollections from "../components/home/FeaturedCollections";
import Creators from "../components/home/Creators";
import WhyMarketplace from "../components/home/WhyMarketplace";
import WhySell from "../components/home/WhySell";
import TrustBadges from "../components/home/TrustBadges";
import BrandStory from "../components/home/BrandStory";
import FinalCTA from "../components/home/FinalCTA";
import Newsletter from "../components/home/Newsletter";

function Home() {
  return (
    <>
      <Hero />
      <Discovery />
      <Categories />
      <FeaturedCollections />
      <Creators />
      <WhyMarketplace />
      <WhySell />
      <TrustBadges />
      <BrandStory />
      <FinalCTA />
      <Newsletter />
    </>
  );
}

export default Home;