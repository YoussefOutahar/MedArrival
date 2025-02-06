package com.cnesten.medarrivalbackend.Security.Models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serial;
import java.io.Serializable;
import java.util.Collection;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "user_type", discriminatorType = DiscriminatorType.STRING)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User implements Serializable, UserDetails {
	@Serial
	private static final long serialVersionUID = 4408418647685225829L;

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	private String firstname;

	private String lastname;

	@Column(unique = true)
	private String email;

	private boolean isEmailVerified;

	private String issuer;

	private String profilePictureUrl;

	private String provider;
	private String providerId;


	private String password;


	@Column(name = "user_type", insertable = false, updatable = false)
	private String userType;

	@JsonIgnore
	@ManyToMany(fetch = FetchType.EAGER)
	@Builder.Default
	@JoinTable(
			name = "user_roles",
			joinColumns = @JoinColumn(name = "user_id"),
			inverseJoinColumns = @JoinColumn(name = "role_id")
	)
	private Set<Role> roles = new HashSet<>();

	public void addRole(Role role) {
		this.roles.add(role);
	}

	public void removeRole(Role role) {
		this.roles.remove(role);
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return CollectionUtils.emptyIfNull(roles).stream()
				.map(role -> new SimpleGrantedAuthority(role.getName()))
				.toList();
	}

	public Role getRole () {
		if (roles.stream().anyMatch(role -> role.getName().equals(RoleConstants.ROLE_ADMIN))) {
			return roles.stream()
					.filter(role -> role.getName().equals(RoleConstants.ROLE_ADMIN))
					.findFirst()
					.orElseThrow();
		} else {
			return roles.iterator().next();
		}
	}

	@Override
	public String getPassword() {
		return password;
	}

	@Override
	public String getUsername() {
		return email;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {return true;}

	@Override
	public boolean isEnabled() {
		return true;
	}

	@Override
	public String toString() {
		return "User{" +
				"id=" + id +
				", email='" + email + '\'' +
				", roles=" + roles +
				'}';
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (!(o instanceof User user)) return false;
        return Objects.equals(getId(), user.getId());
	}

	@Override
	public int hashCode() {
		return Objects.hash(getId());
	}
}
