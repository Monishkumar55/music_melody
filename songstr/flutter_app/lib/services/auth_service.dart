import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/user.dart';

class AuthService {
  String? _token;
  AppUser? _user;

  AppUser? get currentUser => _user;
  String? get token => _token;
  bool get isLoggedIn => _user != null;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
    if (_token != null) {
      await checkAuth();
    }
  }

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_token != null) 'Cookie': 'token=$_token',
    if (_token != null) 'Authorization': 'Bearer $_token',
  };

  Future<AppUser> login(String username, String password) async {
    final res = await http.post(
      Uri.parse(ApiConfig.loginUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );

    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      _user = AppUser.fromJson(data['user']);
      
      if (data['token'] != null) {
        _token = data['token'];
      } else {
        final cookies = res.headers['set-cookie'];
        if (cookies != null) {
          final tokenMatch = RegExp(r'token=([^;]+)').firstMatch(cookies);
          if (tokenMatch != null) {
            _token = tokenMatch.group(1);
          }
        }
      }

      if (_token != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', _token!);
      }
      return _user!;
    } else {
      final err = jsonDecode(res.body);
      throw Exception(err['error'] ?? 'Login failed');
    }
  }

  Future<AppUser> register(String username, String email, String fullname, String password) async {
    final res = await http.post(
      Uri.parse(ApiConfig.registerUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'username': username,
        'email': email,
        'fullname': fullname,
        'password': password,
      }),
    );

    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      _user = AppUser.fromJson(data['user']);
      
      if (data['token'] != null) {
        _token = data['token'];
      } else {
        final cookies = res.headers['set-cookie'];
        if (cookies != null) {
          final tokenMatch = RegExp(r'token=([^;]+)').firstMatch(cookies);
          if (tokenMatch != null) {
            _token = tokenMatch.group(1);
          }
        }
      }

      if (_token != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', _token!);
      }
      return _user!;
    } else {
      final err = jsonDecode(res.body);
      throw Exception(err['error'] ?? 'Registration failed');
    }
  }

  Future<void> checkAuth() async {
    try {
      final res = await http.get(
        Uri.parse(ApiConfig.meUrl),
        headers: _headers,
      );
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['loggedIn'] == true) {
          _user = AppUser.fromJson(data['user']);
        } else {
          _user = null;
          _token = null;
        }
      }
    } catch (e) {
      _user = null;
    }
  }

  Future<void> logout() async {
    try {
      await http.post(Uri.parse(ApiConfig.logoutUrl), headers: _headers);
    } catch (_) {}
    _user = null;
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }
}
