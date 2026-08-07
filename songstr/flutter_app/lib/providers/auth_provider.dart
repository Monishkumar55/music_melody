import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/supabase_sync_service.dart';
import '../models/user.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
  bool _isLoading = false;
  String? _error;

  AppUser? get user => _authService.currentUser;
  String? get token => _authService.token;
  bool get isLoggedIn => _authService.isLoggedIn;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> init() async {
    _isLoading = true;
    notifyListeners();
    await _authService.init();
    if (_authService.isLoggedIn) {
      SupabaseSyncService.instance.initRealtimeSubscription();
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> login(String username, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      await _authService.login(username, password);
      SupabaseSyncService.instance.initRealtimeSubscription();
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String username, String email, String fullname, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      await _authService.register(username, email, fullname, password);
      SupabaseSyncService.instance.initRealtimeSubscription();
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    SupabaseSyncService.instance.dispose();
    await _authService.logout();
    notifyListeners();
  }


  void clearError() {
    _error = null;
    notifyListeners();
  }
}
