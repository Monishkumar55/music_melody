class AppUser {
  final String id;
  final String username;
  final String email;
  final String fullname;
  final String role;
  final String? avatar;
  final String? phone;
  final String? bio;

  AppUser({
    required this.id,
    required this.username,
    required this.email,
    required this.fullname,
    this.role = 'user',
    this.avatar,
    this.phone,
    this.bio,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id']?.toString() ?? '',
      username: json['username'] ?? '',
      email: json['email'] ?? '',
      fullname: json['fullname'] ?? '',
      role: json['role'] ?? 'user',
      avatar: json['avatar'],
      phone: json['phone'],
      bio: json['bio'],
    );
  }

  bool get isAdmin => role == 'admin';
}
