package com.ideahub.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @Column(unique = true, length = 50)
    private String username;

    @Column(length = 500)
    private String bio;

    private int contributionPoints = 0;
    private int ideasCount = 0;
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<com.ideahub.idea.Idea> ideas = new ArrayList<>();

    public User() {}

    public Long getId(){return id;}
    public String getName(){return name;}
    public String getEmail(){return email;}
    public String getUsername(){return username;}
    public String getBio(){return bio;}
    public int getContributionPoints(){return contributionPoints;}
    public int getIdeasCount(){return ideasCount;}
    public LocalDateTime getCreatedAt(){return createdAt;}

    public void setId(Long id){this.id=id;}
    public void setName(String name){this.name=name;}
    public void setEmail(String email){this.email=email;}
    public void setUsername(String username){this.username=username;}
    public void setBio(String bio){this.bio=bio;}
    public void setContributionPoints(int value){this.contributionPoints=value;}
    public void setIdeasCount(int value){this.ideasCount=value;}
}
