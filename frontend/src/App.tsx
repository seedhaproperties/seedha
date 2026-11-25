import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp, BYPASS_AUTH_FOR_DEV } from './context/AppContext';
import { fcmService } from './services/fcmService';
import { BottomNav } from './components';
import {
  SplashScreen,
  LandingScreen,
  OnboardingScreen,
  MobileLoginScreen,
  OTPScreen,
  ProfileSetupScreen,
  PropertyIntentScreen,
  LocationPermissionScreen,
  AuthSuccessScreen,
} from './screens/auth';
import {
  HomeScreen,
  ExploreScreen,
  SearchScreen,
  FiltersScreen,
} from './screens/home';
import {
  BuyPropertiesScreen,
  RentHomesScreen,
  CommercialSpacesScreen,
  PgHostelsScreen,
  FlatmatesScreen,
  PropertyListingScreen,
  PropertyDetailScreen,
  PostPropertyScreen,
  BookVisitScreen,
  CompareScreen,
  ChatScreen,
} from './screens/properties';
import {
  HomeLoanScreen,
  RentalAgreementScreen,
  PropertyManagementScreen,
  OwnerVerificationScreen,
} from './screens/services';
import {
  ProfileScreen,
  PersonalInformationScreen,
  MyPropertiesScreen,
  MyActivityScreen,
  SavedPropertiesScreen,
  PaymentsScreen,
  MyDocumentsScreen,
  NotificationsScreen,
  HelpSupportScreen,
  AccountSettingsScreen,
  PrivacySecurityScreen,
} from './screens/profile';
import {
  AdminLoginScreen,
  AdminDashboardScreen,
  AdminReviewScreen,
  AdminPortalScreen,
} from './screens/admin';

import colors from './theme/colors';

const TAB_SCREENS = new Set(['home', 'explore', 'payments', 'profile']);
const AUTH_SCREENS = new Set([
  'splash', 'onboarding', 'login', 'signup', 'otp',
  'profileSetup', 'propertyIntent', 'locationPermission', 'authSuccess',
]);

function ScreenRouter() {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen.name) {
      case 'splash': return BYPASS_AUTH_FOR_DEV ? <HomeScreen /> : <SplashScreen />;
      // Auth flow (held when BYPASS_AUTH_FOR_DEV is enabled)
      case 'onboarding': return BYPASS_AUTH_FOR_DEV ? <HomeScreen /> : <OnboardingScreen />;
      case 'login': return BYPASS_AUTH_FOR_DEV ? <HomeScreen /> : <MobileLoginScreen />;
      case 'mobileLogin': return BYPASS_AUTH_FOR_DEV ? <HomeScreen /> : <MobileLoginScreen />;
      case 'signup': return BYPASS_AUTH_FOR_DEV ? <HomeScreen /> : <MobileLoginScreen />;
      case 'otp': return BYPASS_AUTH_FOR_DEV ? <HomeScreen /> : <OTPScreen />;
      case 'profileSetup': return <ProfileSetupScreen />;
      case 'propertyIntent': return <PropertyIntentScreen />;
      case 'locationPermission': return <LocationPermissionScreen />;
      case 'authSuccess': return <AuthSuccessScreen />;
      // Main app
      case 'landing': return <LandingScreen />;
      case 'home': return <HomeScreen />;
      case 'explore': return <ExploreScreen />;
      case 'myProperty':
      case 'myProperties': return <MyPropertiesScreen />;
      case 'payments': return <PaymentsScreen />;
      case 'profile': return <ProfileScreen />;
      case 'personalInformation': return <PersonalInformationScreen />;
      case 'myDocuments': return <MyDocumentsScreen />;
      case 'helpSupport': return <HelpSupportScreen />;
      case 'accountSettings': return <AccountSettingsScreen />;
      case 'privacySecurity': return <PrivacySecurityScreen />;
      case 'propertyListing': return <PropertyListingScreen />;
      case 'propertyDetail': return <PropertyDetailScreen />;
      case 'bookVisit': return <BookVisitScreen />;
      case 'chat': return <ChatScreen />;
      case 'homeLoan': return <HomeLoanScreen />;
      case 'rentalAgreement': return <RentalAgreementScreen />;
      case 'propertyManagement': return <PropertyManagementScreen />;
      case 'ownerVerification': return <OwnerVerificationScreen />;
      case 'notifications': return <NotificationsScreen />;
      case 'postProperty': return <PostPropertyScreen />;
      case 'filters': return <FiltersScreen />;
      case 'search': return <SearchScreen />;
      case 'adminPortal': return <AdminPortalScreen />;
      case 'savedProperties': return <SavedPropertiesScreen />;
      case 'myActivity': return <MyActivityScreen />;
      case 'compare': return <CompareScreen />;
      case 'buyProperties': return <BuyPropertiesScreen />;
      case 'rentHomes': return <RentHomesScreen />;
      case 'commercialSpaces': return <CommercialSpacesScreen />;
      case 'pgHostels': return <PgHostelsScreen />;
      case 'flatmates': return <FlatmatesScreen />;
      // Admin Operations Flow
      case 'adminLogin': return <AdminLoginScreen />;
      case 'adminDashboard': return <AdminDashboardScreen />;
      case 'adminReview': return <AdminReviewScreen />;
      default: return <HomeScreen />;
    }
  };

  const showBottomNav = TAB_SCREENS.has(currentScreen.name);

  return (
    <View style={styles.routerContainer}>
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>
      {showBottomNav && <BottomNav />}
    </View>
  );
}

function MainAppShell() {
  const { currentScreen, push, user } = useApp();
  const isDarkScreen = currentScreen.name === 'splash' || currentScreen.name === 'onboarding';

  // Initialize Firebase Cloud Messaging listeners & register device push token
  React.useEffect(() => {
    // Register FCM device token with backend
    fcmService.registerDeviceToken(user?.id);

    // Setup foreground, background-tap and cold-start push notification listeners
    const unsubscribe = fcmService.setupNotificationListeners((screenName, data) => {
      if (screenName) {
        push({ name: screenName as any, params: data });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        isDarkScreen && { backgroundColor: colors.primary },
      ]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style={isDarkScreen ? 'light' : 'dark'} />
      <ScreenRouter />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <MainAppShell />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  routerContainer: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
});
