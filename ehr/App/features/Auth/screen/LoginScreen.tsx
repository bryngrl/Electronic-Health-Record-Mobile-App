import React from 'react';
import { StyleSheet, View, Image, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { useLogin } from '../hook/useLogin';
import { LoginForm } from '../components/LoginForm';

const MOSAIC_SIZE = 170;

export default function LoginScreen() {
  const { 
    email, 
    setEmail, 
    password, 
    setPassword, 
    handleLogin,
    isSubmitting,
    width, 
    height, 
    isLandscape 
  } = useLogin();

  const renderPortrait = () => (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.whiteBackground}>
        {/* Using inline styles here because 'height' and 'width' are accessible in this scope */}
        <Image 
          source={require('@assets/bg-design-left.png')} 
          style={[styles.mosaic, { top: 0, left: -2, transform: [{ rotate: '90deg' }] }]} 
        />
        <Image 
          source={require('@assets/bg-design-right.png')} 
          style={[styles.mosaic, { top: 0, right: -2 }]} 
        />
      </View>

      <View style={[styles.greenCurve, { 
        width: width * 2, 
        height: height, 
        top: height * 0.30, 
        left: -width * 0.5, 
        borderRadius: width 
      }]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.contentWrapper}>
        <View style={styles.portraitStack}>
          <View style={{ flex: 0.7, justifyContent: 'center' }}>
            <Image 
              source={require('@assets/ehr-logo.png')} 
              style={{ width: 220, height: 220, alignSelf: 'center', marginTop: 150 }} 
              resizeMode="contain" 
            />
          </View>
          <LoginForm 
            email={email} 
            setEmail={setEmail} 
            password={password} 
            setPassword={setPassword} 
            handleLogin={handleLogin}
            isSubmitting={isSubmitting}
            containerStyle={{ width: '75%', alignSelf: 'center', marginTop: 20 }}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );

  const renderLandscape = () => (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.whiteBackground}>
        <Image 
          source={require('@assets/bg-design-left.png')} 
          style={[styles.mosaic, { top: -3, left: -3, transform: [{ rotate: '90deg' }] }]} 
        />
        <Image 
          source={require('@assets/bg-design-right.png')} 
          style={[styles.mosaic, { bottom: -20, left: -3, transform: [{ rotate: '180deg' }] }]} 
        />
      </View>

      <View style={[styles.greenCurve, { 
        width: width * 1, 
        height: height * 1.8, 
        top: -height * 0.4, 
        left: width * 0.28, 
        borderRadius: height 
      }]} />

      <View style={styles.landscapeRow}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Image 
            source={require('@assets/ehr-logo.png')} 
            style={{ width: width * 0.3, height: width * 0.3, marginLeft: 150 }} 
            resizeMode="contain" 
          />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', paddingRight: 10, marginLeft: 50 }}>
          <LoginForm 
            email={email} 
            setEmail={setEmail} 
            password={password} 
            setPassword={setPassword} 
            handleLogin={handleLogin}
            isSubmitting={isSubmitting}
            containerStyle={{ width: '90%', maxWidth: 300 }}
          />
        </View>
      </View>
    </View>
  );

  return isLandscape ? renderLandscape() : renderPortrait();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  whiteBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 },
  greenCurve: { position: 'absolute', backgroundColor: '#004d26', zIndex: 2, elevation: 12 },
  mosaic: { position: 'absolute', width: MOSAIC_SIZE, height: MOSAIC_SIZE, resizeMode: 'contain', opacity: 0.8 },
  contentWrapper: { flex: 1, zIndex: 10 },
  portraitStack: { flex: 1, flexDirection: 'column' },
  landscapeRow: { flex: 1, flexDirection: 'row', zIndex: 10 },
});