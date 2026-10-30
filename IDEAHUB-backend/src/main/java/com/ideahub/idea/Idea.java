package com.ideahub.idea;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.ideahub.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ideas")
public class Idea {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String solution;

    @Column(length = 60)
    private String category;

    @Column(length = 30)
    private String status = "NEW";

    private int likes = 0;
    private int views = 0;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    @JsonIgnoreProperties({"ideas"})
    private User author;

    public Idea() {}

    public Long getId(){return id;}
    public String getTitle(){return title;}
    public String getDescription(){return description;}
    public String getSolution(){return solution;}
    public String getCategory(){return category;}
    public String getStatus(){return status;}
    public int getLikes(){return likes;}
    public int getViews(){return views;}
    public LocalDateTime getCreatedAt(){return createdAt;}
    public LocalDateTime getUpdatedAt(){return updatedAt;}
    public User getAuthor(){return author;}

    public void setId(Long id){this.id=id;}
    public void setTitle(String value){this.title=value;}
    public void setDescription(String value){this.description=value;}
    public void setSolution(String value){this.solution=value;}
    public void setCategory(String value){this.category=value;}
    public void setStatus(String value){this.status=value;}
    public void setLikes(int value){this.likes=value;}
    public void setViews(int value){this.views=value;}
    public void setUpdatedAt(LocalDateTime value){this.updatedAt=value;}
    public void setAuthor(User value){this.author=value;}
}
