import axios from "axios";
import prisma from "../config/database";

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface DebtorAnalysis {
  debtorId: number;
  name: string;
  amountOwed: number;
  riskLevel: "low" | "medium" | "high";
  riskFactors: string[];
  paymentLikelihood: number;
  recommendedActions: string[];
  nextPaymentPrediction?: {
    date: string;
    amount: number;
    confidence: number;
  };
}

interface UserInsights {
  totalDebtors: number;
  totalAmountOwed: number;
  averageDebtPerDebtor: number;
  highRiskDebtors: number;
  paymentTrends: string;
  recommendations: string[];
  cashFlowPrediction: {
    nextMonth: number;
    nextThreeMonths: number;
    confidence: "low" | "medium" | "high";
  };
}

export class OpenRouterService {
  private apiKey: string;
  private baseURL = "https://openrouter.ai/api/v1";

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
    if (!this.apiKey) {
      console.warn(
        "OpenRouter API key not found. AI features will be disabled."
      );
    }
  }

  private async makeRequest(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OpenRouter API key not configured");
    }

    try {
      const response = await axios.post<OpenRouterResponse>(
        `${this.baseURL}/chat/completions`,
        {
          model: "anthropic/claude-3.5-sonnet",
          messages: [
            {
              role: "system",
              content: `You are an expert financial analyst specializing in debt management and risk assessment. 
              Analyze the provided debtor data and provide actionable insights, risk assessments, and recommendations.
              Always respond with valid JSON format.`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://tuabi-app.com",
            "X-Title": "Tuabi Debt Management AI",
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("OpenRouter API error:", error);
      throw new Error("Failed to get AI analysis");
    }
  }

  async analyzeDebtor(
    userId: number,
    debtorId: number
  ): Promise<DebtorAnalysis> {
    // Fetch debtor data with history
    const debtor = await prisma.debtor.findFirst({
      where: {
        id: debtorId,
        userId: userId,
      },
      include: {
        history: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!debtor) {
      throw new Error("Debtor not found");
    }

    // Calculate payment statistics
    const payments = debtor.history.filter((h) => h.action === "reduce");
    const additions = debtor.history.filter((h) => h.action === "add");
    const totalPaid = payments.reduce((sum, p) => sum + p.amountChanged, 0);
    const totalAdded = additions.reduce((sum, a) => sum + a.amountChanged, 0);
    const paymentCount = payments.length;
    const daysSinceCreation = Math.floor(
      (Date.now() - debtor.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const prompt = `
    Analyze this debtor's financial behavior and provide a comprehensive risk assessment:

    DEBTOR DATA:
    - Name: ${debtor.name}
    - Current Amount Owed: $${debtor.amountOwed}
    - Total Amount Added: $${totalAdded}
    - Total Amount Paid: $${totalPaid}
    - Payment Count: ${paymentCount}
    - Days Since Creation: ${daysSinceCreation}
    - Payment History: ${JSON.stringify(payments.slice(0, 5))}

    Please provide analysis in this exact JSON format:
    {
      "debtorId": ${debtor.id},
      "name": "${debtor.name}",
      "amountOwed": ${debtor.amountOwed},
      "riskLevel": "low|medium|high",
      "riskFactors": ["factor1", "factor2"],
      "paymentLikelihood": 0.85,
      "recommendedActions": ["action1", "action2"],
      "nextPaymentPrediction": {
        "date": "2024-01-15",
        "amount": 500,
        "confidence": 0.75
      }
    }
    `;

    const response = await this.makeRequest(prompt);

    try {
      return JSON.parse(response);
    } catch (error) {
      console.error("Failed to parse AI response:", response);
      throw new Error("Invalid AI response format");
    }
  }

  async getUserInsights(userId: number): Promise<UserInsights> {
    // Fetch comprehensive user data
    const debtors = await prisma.debtor.findMany({
      where: { userId },
      include: {
        history: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    const totalDebtors = debtors.length;
    const totalAmountOwed = debtors.reduce((sum, d) => sum + d.amountOwed, 0);
    const activeDebtors = debtors.filter((d) => d.amountOwed > 0);
    const averageDebtPerDebtor =
      activeDebtors.length > 0 ? totalAmountOwed / activeDebtors.length : 0;

    // Get recent activity
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPayments = await prisma.debtHistory.aggregate({
      where: {
        debtor: { userId },
        action: "reduce",
        timestamp: { gte: thirtyDaysAgo },
      },
      _sum: { amountChanged: true },
      _count: { id: true },
    });

    const recentAdditions = await prisma.debtHistory.aggregate({
      where: {
        debtor: { userId },
        action: "add",
        timestamp: { gte: thirtyDaysAgo },
      },
      _sum: { amountChanged: true },
      _count: { id: true },
    });

    const prompt = `
    Analyze this user's debt management portfolio and provide comprehensive insights:

    PORTFOLIO DATA:
    - Total Debtors: ${totalDebtors}
    - Active Debtors: ${activeDebtors.length}
    - Total Amount Owed: $${totalAmountOwed}
    - Average Debt Per Debtor: $${averageDebtPerDebtor}
    - Recent Payments (30 days): $${recentPayments._sum.amountChanged || 0} (${
      recentPayments._count.id
    } transactions)
    - Recent Additions (30 days): $${
      recentAdditions._sum.amountChanged || 0
    } (${recentAdditions._count.id} transactions)
    
    DEBTOR DETAILS:
    ${debtors
      .map(
        (d) => `
    - ${d.name}: $${d.amountOwed} owed, ${
          d.history.filter((h) => h.action === "reduce").length
        } payments
    `
      )
      .join("")}

    Please provide analysis in this exact JSON format:
    {
      "totalDebtors": ${totalDebtors},
      "totalAmountOwed": ${totalAmountOwed},
      "averageDebtPerDebtor": ${averageDebtPerDebtor},
      "highRiskDebtors": 3,
      "paymentTrends": "description of payment trends",
      "recommendations": ["recommendation1", "recommendation2"],
      "cashFlowPrediction": {
        "nextMonth": 2500,
        "nextThreeMonths": 7500,
        "confidence": "medium"
      }
    }
    `;

    const response = await this.makeRequest(prompt);

    try {
      return JSON.parse(response);
    } catch (error) {
      console.error("Failed to parse AI response:", response);
      throw new Error("Invalid AI response format");
    }
  }

  async getPaymentPredictions(userId: number): Promise<any> {
    // Fetch debtors with payment history
    const debtors = await prisma.debtor.findMany({
      where: {
        userId,
        amountOwed: { gt: 0 }, // Only active debtors
      },
      include: {
        history: {
          where: { action: "reduce" },
          orderBy: { timestamp: "desc" },
        },
      },
    });

    const prompt = `
    Predict payment patterns for these debtors based on their payment history:

    DEBTOR PAYMENT DATA:
    ${debtors
      .map(
        (d) => `
    - ${d.name}: $${d.amountOwed} owed
      Payment History: ${d.history
        .map(
          (h) =>
            `$${h.amountChanged} on ${h.timestamp.toISOString().split("T")[0]}`
        )
        .join(", ")}
    `
      )
      .join("")}

    Please provide payment predictions in this exact JSON format:
    {
      "predictions": [
        {
          "debtorId": 1,
          "debtorName": "John Smith",
          "nextPaymentDate": "2024-01-15",
          "predictedAmount": 500,
          "confidence": 0.85,
          "reasoning": "Based on monthly payment pattern"
        }
      ],
      "totalExpectedPayments": 2500,
      "timeframe": "next 30 days"
    }
    `;

    const response = await this.makeRequest(prompt);

    try {
      return JSON.parse(response);
    } catch (error) {
      console.error("Failed to parse AI response:", response);
      throw new Error("Invalid AI response format");
    }
  }

  async getRiskAssessment(userId: number): Promise<any> {
    const debtors = await prisma.debtor.findMany({
      where: { userId },
      include: {
        history: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    const prompt = `
    Assess the overall risk profile of this debt portfolio:

    PORTFOLIO RISK DATA:
    ${debtors
      .map((d) => {
        const payments = d.history.filter((h) => h.action === "reduce");
        const additions = d.history.filter((h) => h.action === "add");
        const totalPaid = payments.reduce((sum, p) => sum + p.amountChanged, 0);
        const totalAdded = additions.reduce(
          (sum, a) => sum + a.amountChanged,
          0
        );
        const daysSinceCreation = Math.floor(
          (Date.now() - d.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        return `
      - ${d.name}: $${d.amountOwed} owed, $${totalPaid} paid, ${payments.length} payments, ${daysSinceCreation} days
      `;
      })
      .join("")}

    Please provide risk assessment in this exact JSON format:
    {
      "overallRiskLevel": "medium",
      "riskFactors": ["factor1", "factor2"],
      "debtorRiskBreakdown": [
        {
          "debtorId": 1,
          "name": "John Smith",
          "riskLevel": "high",
          "riskScore": 0.85,
          "riskFactors": ["factor1", "factor2"]
        }
      ],
      "recommendations": ["recommendation1", "recommendation2"]
    }
    `;

    const response = await this.makeRequest(prompt);

    try {
      return JSON.parse(response);
    } catch (error) {
      console.error("Failed to parse AI response:", response);
      throw new Error("Invalid AI response format");
    }
  }
}

export const openRouterService = new OpenRouterService();
