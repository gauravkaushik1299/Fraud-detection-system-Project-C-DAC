#%% Importing Libraries
import psycopg2  
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from category_encoders import TargetEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import seaborn as sns
from matplotlib import pyplot as plt
from scipy.stats import norm
import warnings

warnings.filterwarnings('ignore')

#%% Connecting Python with PostgreSQL
# Step 1: Establishing Connection with PostgreSQL

connection = psycopg2.connect(
    host='localhost',
    user='postgres',   # Replace with your PostgreSQL username
    password='abc123',  # Replace with your PostgreSQL password
    database='postgres'  # Replace with your database name
)

query = "SELECT * FROM transactions"
df = pd.read_sql(query, connection)
df.head()

connection.close()

#%% Data Cleaning & Preprocessing
# Step 2: Data Preprocessing

# Drop rows with missing values
df.dropna(inplace=True)

# Checking and dropping duplicate rows
df.drop_duplicates(inplace=True)

# Dropping columns not needed for training
df.drop(columns=['trans_date_trans_time', 'trans_num'], inplace=True)

# One-hot encoding categorical variable 'gender'
df = pd.get_dummies(df, columns=['gender'], drop_first=True)

# Target Encoding for high cardinality categorical variables
response_variable = 'is_fraud'
categorical_columns = ['job', 'state', 'street', 'merchant', 'city', 'category']

# Initialize target encoder
target_encoder = TargetEncoder(cols=categorical_columns)

# Fit and transform the data
df_encoded = target_encoder.fit_transform(df[categorical_columns], df[response_variable])

# Drop original categorical columns and add encoded ones
df.drop(columns=categorical_columns, inplace=True)
df = pd.concat([df, df_encoded], axis=1)

# Scaling numerical features
scaler = StandardScaler()
numerical_features = ['amt', 'zip', 'lat', 'long', 'city_pop', 'unix_time', 'merch_lat', 'merch_long']
df[numerical_features] = scaler.fit_transform(df[numerical_features])

#%% Feature Selection
# Step 3: Feature Selection

# Finding Correlation between columns
sub_sample_corr = df.corr()

# Plot heatmap to visualize correlations
plt.figure(figsize=(17, 10))
sns.heatmap(sub_sample_corr, cmap='coolwarm_r', annot=True, annot_kws={'size':12})
plt.title('SubSample Correlation Matrix', fontsize=14)
plt.show()

# Filter relevant correlations
threshold = 0.2
correlation_with_response = sub_sample_corr['is_fraud'].drop('is_fraud')
relevant_correlations = correlation_with_response[abs(correlation_with_response) > threshold].abs().sort_values(ascending=False)

# Visualize the most relevant correlations
plt.figure(figsize=(10, 8))
sns.barplot(x=relevant_correlations.values, y=relevant_correlations.index, palette='coolwarm')
plt.xlabel('Correlation with Response Variable')
plt.ylabel('Predictor Variables')
plt.title('Correlation with Response Variable')
plt.show()

# Select relevant features
relevant_variables = relevant_correlations.index.tolist()
columns_to_keep = relevant_variables + ['is_fraud']
df = df[columns_to_keep].copy()

#%% Model Training
# Step 4: Model Training

# Undersampling before cross-validating (prone to overfit)
X = df.drop('is_fraud', axis=1)
y = df['is_fraud']

# Splitting the dataset into training and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=21)

# Define classifiers
classifiers = {
    "Logistic Regression": LogisticRegression(),
    "K-Nearest Neighbors": KNeighborsClassifier(),
    "Support Vector Classifier": SVC(),
    "Decision Tree Classifier": DecisionTreeClassifier()
}

# Train and evaluate each classifier
for clf_name, clf in classifiers.items():
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)
    
    print(f"\n{clf_name} Evaluation:")
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print("Classification Report:")
    print(classification_report(y_test, y_pred))
    print("ROC AUC Score:")
    print(roc_auc_score(y_test, y_pred))
    
    # Perform cross-validation
    cv_scores = cross_val_score(clf, X_train, y_train, cv=5)
    print(f"Cross-validation Mean Accuracy: {cv_scores.mean() * 100:.2f}%")


from sklearn.model_selection import learning_curve

def plot_learning_curve(estimator, title, X, y, ylim=None, cv=None, n_jobs=None, train_sizes=np.linspace(.1, 1.0, 5)):
    plt.figure()
    plt.title(title)
    if ylim is not None:
        plt.ylim(*ylim)
    plt.xlabel("Training examples")
    plt.ylabel("Score")
    train_sizes, train_scores, test_scores = learning_curve(
        estimator, X, y, cv=cv, n_jobs=n_jobs, train_sizes=train_sizes)
    train_scores_mean = np.mean(train_scores, axis=1)
    train_scores_std = np.std(train_scores, axis=1)
    test_scores_mean = np.mean(test_scores, axis=1)
    test_scores_std = np.std(test_scores, axis=1)
    plt.grid()

    plt.fill_between(train_sizes, train_scores_mean - train_scores_std,
                     train_scores_mean + train_scores_std, alpha=0.1,
                     color="r")
    plt.fill_between(train_sizes, test_scores_mean - test_scores_std,
                     test_scores_mean + test_scores_std, alpha=0.1, color="g")
    plt.plot(train_sizes, train_scores_mean, 'o-', color="r",
             label="Training score")
    plt.plot(train_sizes, test_scores_mean, 'o-', color="g",
             label="Cross-validation score")

    plt.legend(loc="best")
    return plt
#%% Model Selection & Saving
# Step 5: Select the best model based on evaluation metrics and save it for deployment
import joblib
# Assuming the best model is Logistic Regression for example
best_model = classifiers["Logistic Regression"]
joblib.dump(best_model, 'fraud_detection_model.pkl')

print("\nBest model saved successfully!")
