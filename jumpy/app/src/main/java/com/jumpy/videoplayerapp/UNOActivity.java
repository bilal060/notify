package com.jumpy.videoplayerapp;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.animation.ObjectAnimator;
import android.animation.ValueAnimator;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import android.view.View;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public class UNOActivity extends AppCompatActivity {
    
    private LinearLayout playerHandLayout;
    private LinearLayout computerHandLayout;
    private ImageView topCardImageView;
    private TextView currentPlayerText;
    private TextView deckCountText;
    private Button drawCardButton;
    private Button unoButton;
    
    private List<UNOCard> deck;
    private List<UNOCard> playerHand;
    private List<UNOCard> computerHand;
    private UNOCard topCard;
    private boolean isPlayerTurn = true;
    private boolean gameOver = false;
    private int currentColor = -1; // -1 means no color restriction
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_uno);
        
        initializeViews();
        setupGame();
        updateUI();
    }
    
    private void initializeViews() {
        playerHandLayout = findViewById(R.id.playerHandLayout);
        computerHandLayout = findViewById(R.id.computerHandLayout);
        topCardImageView = findViewById(R.id.topCardImageView);
        currentPlayerText = findViewById(R.id.currentPlayerText);
        deckCountText = findViewById(R.id.deckCountText);
        drawCardButton = findViewById(R.id.drawCardButton);
        unoButton = findViewById(R.id.unoButton);
        
        drawCardButton.setOnClickListener(v -> drawCard());
        unoButton.setOnClickListener(v -> callUno());
    }
    
    private void setupGame() {
        createDeck();
        shuffleDeck();
        dealInitialCards();
        startFirstTurn();
    }
    
    private void createDeck() {
        deck = new ArrayList<>();
        
        // Number cards (0-9) for each color
        String[] colors = {"red", "blue", "green", "yellow"};
        for (String color : colors) {
            // One 0 card per color
            deck.add(new UNOCard(color, "0", 0));
            
            // Two of each 1-9 cards per color
            for (int i = 1; i <= 9; i++) {
                deck.add(new UNOCard(color, String.valueOf(i), i));
                deck.add(new UNOCard(color, String.valueOf(i), i));
            }
            
            // Action cards (2 each per color)
            deck.add(new UNOCard(color, "skip", 20));
            deck.add(new UNOCard(color, "skip", 20));
            deck.add(new UNOCard(color, "reverse", 20));
            deck.add(new UNOCard(color, "reverse", 20));
            deck.add(new UNOCard(color, "draw2", 20));
            deck.add(new UNOCard(color, "draw2", 20));
        }
        
        // Wild cards (4 each)
        for (int i = 0; i < 4; i++) {
            deck.add(new UNOCard("wild", "wild", 50));
            deck.add(new UNOCard("wild", "draw4", 50));
        }
    }
    
    private void shuffleDeck() {
        Collections.shuffle(deck);
    }
    
    private void dealInitialCards() {
        playerHand = new ArrayList<>();
        computerHand = new ArrayList<>();
        
        // Deal 7 cards to each player
        for (int i = 0; i < 7; i++) {
            playerHand.add(deck.remove(0));
            computerHand.add(deck.remove(0));
        }
        
        // Set top card (skip action cards)
        do {
            topCard = deck.remove(0);
        } while (topCard.isActionCard());
        
        currentColor = getColorValue(topCard.color);
    }
    
    private void startFirstTurn() {
        isPlayerTurn = true;
        updateUI();
    }
    
    private void updateUI() {
        updatePlayerHand();
        updateComputerHand();
        updateTopCard();
        updateGameInfo();
        updateButtons();
    }
    
    private void updatePlayerHand() {
        playerHandLayout.removeAllViews();
        
        for (int i = 0; i < playerHand.size(); i++) {
            UNOCard card = playerHand.get(i);
            CardView cardView = createCardView(card, true, i);
            playerHandLayout.addView(cardView);
        }
    }
    
    private void updateComputerHand() {
        computerHandLayout.removeAllViews();
        
        for (int i = 0; i < computerHand.size(); i++) {
            CardView cardView = createCardView(null, false, i);
            computerHandLayout.addView(cardView);
        }
    }
    
    private CardView createCardView(UNOCard card, boolean isPlayer, int index) {
        CardView cardView = new CardView(this);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                dpToPx(60), dpToPx(80)
        );
        params.setMargins(dpToPx(4), 0, dpToPx(4), 0);
        cardView.setLayoutParams(params);
        cardView.setRadius(dpToPx(8));
        cardView.setCardElevation(dpToPx(4));
        
        if (isPlayer && card != null) {
            cardView.setCardBackgroundColor(getCardColor(card));
            
            TextView cardText = new TextView(this);
            cardText.setText(card.value);
            cardText.setTextColor(Color.WHITE);
            cardText.setTextSize(16);
            cardText.setGravity(android.view.Gravity.CENTER);
            cardView.addView(cardText);
            
            final int cardIndex = index;
            cardView.setOnClickListener(v -> playCard(cardIndex));
        } else {
            cardView.setCardBackgroundColor(Color.GRAY);
            
            TextView cardText = new TextView(this);
            cardText.setText("?");
            cardText.setTextColor(Color.WHITE);
            cardText.setTextSize(16);
            cardText.setGravity(android.view.Gravity.CENTER);
            cardView.addView(cardText);
        }
        
        return cardView;
    }
    
    private void updateTopCard() {
        if (topCard != null) {
            topCardImageView.setBackgroundColor(getCardColor(topCard));
            // In a real app, you'd set an actual card image here
        }
    }
    
    private void updateGameInfo() {
        currentPlayerText.setText(isPlayerTurn ? "Your Turn" : "Computer's Turn");
        deckCountText.setText("Deck: " + deck.size());
    }
    
    private void updateButtons() {
        drawCardButton.setEnabled(isPlayerTurn && !gameOver);
        unoButton.setEnabled(isPlayerTurn && playerHand.size() == 1 && !gameOver);
    }
    
    private int getCardColor(UNOCard card) {
        switch (card.color) {
            case "red": return Color.RED;
            case "blue": return Color.BLUE;
            case "green": return Color.GREEN;
            case "yellow": return Color.YELLOW;
            case "wild": return Color.BLACK;
            default: return Color.GRAY;
        }
    }
    
    private int getColorValue(String color) {
        switch (color) {
            case "red": return 0;
            case "blue": return 1;
            case "green": return 2;
            case "yellow": return 3;
            default: return -1;
        }
    }
    
    private void playCard(int cardIndex) {
        if (!isPlayerTurn || gameOver) return;
        
        UNOCard card = playerHand.get(cardIndex);
        
        if (canPlayCard(card)) {
            // Remove card from hand
            playerHand.remove(cardIndex);
            
            // Apply card effects
            applyCardEffects(card);
            
            // Update top card
            topCard = card;
            currentColor = getColorValue(card.color);
            
            // Check for win
            if (playerHand.isEmpty()) {
                gameOver = true;
                showGameResult("You Win!");
                return;
            }
            
            // Switch turns
            isPlayerTurn = false;
            updateUI();
            
            // Computer's turn
            new Handler().postDelayed(this::computerTurn, 1000);
        } else {
            Toast.makeText(this, "Invalid card!", Toast.LENGTH_SHORT).show();
        }
    }
    
    private boolean canPlayCard(UNOCard card) {
        if (card.color.equals("wild")) return true;
        if (currentColor == -1) return true;
        return card.color.equals(topCard.color) || card.value.equals(topCard.value);
    }
    
    private void applyCardEffects(UNOCard card) {
        switch (card.value) {
            case "skip":
                // Skip next turn
                break;
            case "reverse":
                // Reverse direction (in 2-player, same as skip)
                break;
            case "draw2":
                // Next player draws 2 cards
                if (!isPlayerTurn) {
                    drawCards(2);
                }
                break;
            case "draw4":
                // Next player draws 4 cards
                if (!isPlayerTurn) {
                    drawCards(4);
                }
                break;
        }
    }
    
    private void drawCard() {
        if (!isPlayerTurn || gameOver) return;
        
        if (deck.isEmpty()) {
            reshuffleDeck();
        }
        
        playerHand.add(deck.remove(0));
        isPlayerTurn = false;
        updateUI();
        
        new Handler().postDelayed(this::computerTurn, 1000);
    }
    
    private void drawCards(int count) {
        for (int i = 0; i < count; i++) {
            if (deck.isEmpty()) {
                reshuffleDeck();
            }
            playerHand.add(deck.remove(0));
        }
    }
    
    private void reshuffleDeck() {
        // Collect all cards except top card
        List<UNOCard> allCards = new ArrayList<>();
        allCards.addAll(playerHand);
        allCards.addAll(computerHand);
        
        // Remove top card temporarily
        UNOCard tempTop = topCard;
        
        // Shuffle and create new deck
        Collections.shuffle(allCards);
        deck = allCards;
        
        // Put top card back
        topCard = tempTop;
    }
    
    private void callUno() {
        if (playerHand.size() == 1) {
            Toast.makeText(this, "UNO!", Toast.LENGTH_SHORT).show();
        }
    }
    
    private void computerTurn() {
        if (gameOver) return;
        
        // Simple AI: play first valid card
        UNOCard cardToPlay = null;
        int cardIndex = -1;
        
        for (int i = 0; i < computerHand.size(); i++) {
            UNOCard card = computerHand.get(i);
            if (canPlayCard(card)) {
                cardToPlay = card;
                cardIndex = i;
                break;
            }
        }
        
        if (cardToPlay != null) {
            // Play the card
            computerHand.remove(cardIndex);
            applyCardEffects(cardToPlay);
            topCard = cardToPlay;
            currentColor = getColorValue(cardToPlay.color);
            
            if (computerHand.isEmpty()) {
                gameOver = true;
                showGameResult("Computer Wins!");
                return;
            }
        } else {
            // Draw a card
            if (deck.isEmpty()) {
                reshuffleDeck();
            }
            computerHand.add(deck.remove(0));
        }
        
        isPlayerTurn = true;
        updateUI();
    }
    
    private void showGameResult(String message) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
        new Handler().postDelayed(this::finish, 2000);
    }
    
    private int dpToPx(int dp) {
        float density = getResources().getDisplayMetrics().density;
        return Math.round(dp * density);
    }
    
    private static class UNOCard {
        String color;
        String value;
        int points;
        
        UNOCard(String color, String value, int points) {
            this.color = color;
            this.value = value;
            this.points = points;
        }
        
        boolean isActionCard() {
            return value.equals("skip") || value.equals("reverse") || 
                   value.equals("draw2") || value.equals("wild") || 
                   value.equals("draw4");
        }
    }
} 