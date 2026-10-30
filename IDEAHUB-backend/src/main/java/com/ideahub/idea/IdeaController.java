package com.ideahub.idea;

import com.ideahub.user.User;
import com.ideahub.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/ideas")
public class IdeaController {
    private final IdeaRepository ideas;
    private final UserRepository users;

    public IdeaController(IdeaRepository ideas, UserRepository users) {
        this.ideas = ideas;
        this.users = users;
    }

    @GetMapping
    public List<Idea> getAllIdeas() {
        return ideas.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/{id}")
    public Idea getIdea(@PathVariable Long id) {
        Idea idea = findIdea(id);
        idea.setViews(idea.getViews() + 1);
        return ideas.save(idea);
    }

    @GetMapping("/user/{userId}")
    public List<Idea> getIdeasByUser(@PathVariable Long userId) {
        return ideas.findByAuthorIdOrderByCreatedAtDesc(userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Idea createIdea(@RequestBody IdeaRequest request) {
        User author = users.findById(request.getAuthorId())
                .orElseThrow(() -> new RuntimeException("Author not found"));

        Idea idea = new Idea();
        idea.setTitle(request.getTitle());
        idea.setDescription(request.getDescription());
        idea.setSolution(request.getSolution());
        idea.setCategory(request.getCategory());
        idea.setStatus("NEW");
        idea.setAuthor(author);

        Idea saved = ideas.save(idea);

        author.setIdeasCount(author.getIdeasCount() + 1);
        author.setContributionPoints(author.getContributionPoints() + 25);
        users.save(author);

        return saved;
    }

    @PutMapping("/{id}")
    public Idea updateIdea(@PathVariable Long id, @RequestBody IdeaRequest request) {
        Idea idea = findIdea(id);
        idea.setTitle(request.getTitle());
        idea.setDescription(request.getDescription());
        idea.setSolution(request.getSolution());
        idea.setCategory(request.getCategory());
        idea.setUpdatedAt(LocalDateTime.now());
        return ideas.save(idea);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteIdea(@PathVariable Long id) {
        Idea idea = findIdea(id);
        User author = idea.getAuthor();
        ideas.delete(idea);
        author.setIdeasCount(Math.max(0, author.getIdeasCount() - 1));
        author.setContributionPoints(Math.max(0, author.getContributionPoints() - 10));
        users.save(author);
    }

    @PostMapping("/{id}/like")
    public Idea likeIdea(@PathVariable Long id) {
        Idea idea = findIdea(id);
        idea.setLikes(idea.getLikes() + 1);
        return ideas.save(idea);
    }

    private Idea findIdea(Long id) {
        return ideas.findById(id)
                .orElseThrow(() -> new RuntimeException("Idea not found"));
    }
}
