package com.ideahub.idea;

public class IdeaRequest {
    private String title;
    private String description;
    private String solution;
    private String category;
    private Long authorId;

    public String getTitle(){return title;}
    public String getDescription(){return description;}
    public String getSolution(){return solution;}
    public String getCategory(){return category;}
    public Long getAuthorId(){return authorId;}

    public void setTitle(String value){this.title=value;}
    public void setDescription(String value){this.description=value;}
    public void setSolution(String value){this.solution=value;}
    public void setCategory(String value){this.category=value;}
    public void setAuthorId(Long value){this.authorId=value;}
}
